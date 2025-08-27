import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

@Injectable()
export class WordpressService {
  async setupWordpress(config: any): Promise<string> {
    const {
      dbName,
      dbUser,
      dbPassword,
      wpAdminUser,
      wpAdminPassword,
      wpAdminEmail,
      siteTitle,
      siteUrl,
    } = config;

    try {
      console.log('Starting WordPress setup process...');

      const dockerComposeYml = `
version: '3.8'

services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${dbPassword}
      MYSQL_DATABASE: ${dbName}
      MYSQL_USER: ${dbUser}
      MYSQL_PASSWORD: ${dbPassword}
    volumes:
      - db_data:/var/lib/mysql
    command: --skip-host-cache --skip-name-resolve --innodb-buffer-pool-size=64M

  wordpress:
    image: wordpress:latest
    restart: always
    depends_on:
      - db
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: ${dbUser}
      WORDPRESS_DB_PASSWORD: ${dbPassword}

volumes:
  db_data:
      `;

      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, 'docker-compose.yml');

      await fs.promises.writeFile(filePath, dockerComposeYml.trim());
      console.log('docker-compose.yml file created.');

      await execAsync('docker-compose up -d', { cwd: __dirname });
      console.log('Docker services started.');

  
      console.log('Retrieving WordPress container name...');
      const { stdout } = await execAsync(
        'docker ps --filter "ancestor=wordpress" --format "{{.Names}}"',
      );
      const wordpressContainerName = stdout.trim();
      console.log(`WordPress container name: ${wordpressContainerName}`);


      await execAsync(`docker exec ${wordpressContainerName} apt-get update`);
      await execAsync(
        `docker exec ${wordpressContainerName} apt-get install -y curl`,
      );
      await execAsync(
        `docker exec ${wordpressContainerName} apt-get install -y less`,
      );
      await execAsync(
        `docker exec ${wordpressContainerName} curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar`,
      );
      await execAsync(
        `docker exec ${wordpressContainerName} chmod +x wp-cli.phar`,
      );
      await execAsync(
        `docker exec ${wordpressContainerName} mv wp-cli.phar /usr/local/bin/wp`,
      );
      console.log('WP-CLI installed.');
      await this.sleep(30000);

      console.log('Checking for existing wp-config.php...');
      const checkConfigCmd = `docker exec ${wordpressContainerName} ls /var/www/html/wp-config.php`;
      try {
        await execAsync(checkConfigCmd);
        console.log('wp-config.php exists. Removing...');
        await execAsync(
          `docker exec ${wordpressContainerName} rm /var/www/html/wp-config.php`,
        );
        console.log('wp-config.php removed.');
      } catch (error) {
        console.log('wp-config.php does not exist. No need to remove.');
      }

      await execAsync(
        `docker exec ${wordpressContainerName} wp config create --dbname=${dbName} --dbuser=${dbUser} --dbpass=${dbPassword} --dbhost=db --path=/var/www/html --allow-root`,
      );
      console.log('wp-config.php created.');

      await execAsync(
        `docker exec ${wordpressContainerName} wp core install --url="${siteUrl}" --title="${siteTitle}" --admin_user="${wpAdminUser}" --admin_password="${wpAdminPassword}" --admin_email="${wpAdminEmail}" --skip-email --allow-root`,
      );
      console.log('WordPress installed.');

      return 'WordPress setup complete!';
    } catch (error) {
      console.error('Error during WordPress setup:', error);
      throw new Error('WordPress setup failed');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
