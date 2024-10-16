import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { CreateWordPressDto } from './wp.interface';

@Injectable()
export class WordPressService {
  async setupWordPress(createWordPressDto: CreateWordPressDto) {
    const {
      siteName,
      adminUser,
      adminPassword,
      adminEmail,
      language,
    } = createWordPressDto;

    // Default values for database configuration
    const dbName = 'wordpress_db';
    const dbUser = 'wordpress_user';
    const dbPassword = 'strong_password';

    // Dynamically create the Docker Compose file
    const dockerComposeContent = `
    version: '3.8'
    services:
      db:
        image: mysql:5.7
        container_name: wordpress-db
        environment:
          MYSQL_ROOT_PASSWORD: root_password
          MYSQL_DATABASE: ${dbName}
          MYSQL_USER: ${dbUser}
          MYSQL_PASSWORD: ${dbPassword}
        ports:
          - "3307:3306"
        volumes:
          - db_data:/var/lib/mysql
        networks:
          - wp-net

      wordpress:
        image: wordpress:latest
        container_name: wordpress
        depends_on:
          - db
        environment:
          WORDPRESS_DB_HOST: db:3306
          WORDPRESS_DB_NAME: ${dbName}
          WORDPRESS_DB_USER: ${dbUser}
          WORDPRESS_DB_PASSWORD: ${dbPassword}
          WORDPRESS_TABLE_PREFIX: wp_
          WORDPRESS_CONFIG_EXTRA: |
            define('WP_DEBUG', false);
            define('WP_SITEURL', 'http://localhost:8000');
            define('WP_HOME', 'http://localhost:8000');
            define('WPLANG', '${language}');
        ports:
          - "8000:80"
        volumes:
          - ./wordpress:/var/www/html
          - ./custom/wp-config.php:/var/www/html/wp-config.php  # Mount custom wp-config.php
        networks:
          - wp-net

    networks:
      wp-net:

    volumes:
      db_data:
    `;

    // Write the Docker Compose content to a file
    const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
    fs.writeFileSync(dockerComposePath, dockerComposeContent);

    // Create the custom wp-config.php file
    const wpConfigContent = `<?php
    /**
     * The base configuration for WordPress
     */

    // Docker-specific function to get environment variables
    if (!function_exists('getenv_docker')) {
        function getenv_docker($env, $default) {
            if ($fileEnv = getenv($env . '_FILE')) {
                return rtrim(file_get_contents($fileEnv), "\r\n");
            } else if (($val = getenv($env)) !== false) {
                return $val;
            } else {
                return $default;
            }
        }
    }

    /** The name of the database for WordPress */
    define('DB_NAME', getenv_docker('WORDPRESS_DB_NAME', '${dbName}'));

    /** Database username */
    define('DB_USER', getenv_docker('WORDPRESS_DB_USER', '${dbUser}'));

    /** Database password */
    define('DB_PASSWORD', getenv_docker('WORDPRESS_DB_PASSWORD', '${dbPassword}'));

    /** Database hostname */
    define('DB_HOST', getenv_docker('WORDPRESS_DB_HOST', 'db'));

    /** Database charset */
    define('DB_CHARSET', getenv_docker('WORDPRESS_DB_CHARSET', 'utf8'));

    /** The database collate type. Don't change this if in doubt. */
    define('DB_COLLATE', getenv_docker('WORDPRESS_DB_COLLATE', ''));

    /** WordPress database table prefix */
    $table_prefix = getenv_docker('WORDPRESS_TABLE_PREFIX', 'wp_');

    /** Enable debugging */
    define('WP_DEBUG', !!getenv_docker('WORDPRESS_DEBUG', ''));

    /** Absolute path to the WordPress directory. */
    if (!defined('ABSPATH')) {
        define('ABSPATH', __DIR__ . '/');
    }

    /** Sets up WordPress vars and included files. */
    require_once ABSPATH . 'wp-settings.php';
    `;

    // Write the custom wp-config.php content to a file
    const wpConfigPath = path.join(process.cwd(), 'custom', 'wp-config.php');
    fs.mkdirSync(path.join(process.cwd(), 'custom'), { recursive: true }); // Ensure the directory exists
    fs.writeFileSync(wpConfigPath, wpConfigContent);

    // Start the Docker containers
    await this.runCommand('docker-compose up -d');

    // Configure WordPress after containers are up
    await this.configureWordPress(siteName, adminUser, adminPassword, adminEmail);
  }

  private runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error executing command: ${stderr}`);
          return reject(err);
        }
        console.log(stdout);
        resolve();
      });
    });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async configureWordPress(
    siteName: string,
    adminUser: string,
    adminPassword: string,
    adminEmail: string,
  ) {
    // Wait for WordPress container to be fully up
    await this.sleep(10000); // Windows-friendly sleep command

    // Use WP-CLI (inside the WordPress container) to complete the setup
    const setupCommands = `\
      docker exec wordpress wp core install --url="http://localhost:8000" \
        --title="${siteName}" \
        --admin_user="${adminUser}" \
        --admin_password="${adminPassword}" \
        --admin_email="${adminEmail}" \
        --skip-email;

      docker exec wordpress wp option update blogdescription "Just another automated WordPress site";
    `;

    await this.runCommand(setupCommands);
  }
}
