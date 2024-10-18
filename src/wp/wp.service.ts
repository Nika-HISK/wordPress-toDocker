import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

@Injectable()
export class WordpressService {
  async setupWordpress(): Promise<string> {
    try {
      console.log('Starting WordPress setup process...');

      // Step 1: Create docker-compose.yml
      console.log('Creating docker-compose.yml file...');
      const dockerComposeYml = `
version: '3.8' 

services:
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: paroli123
      MYSQL_DATABASE: ramedb
      MYSQL_USER: nika_chinchaladze
      MYSQL_PASSWORD: paroli123
    volumes:
      - db_data:/var/lib/mysql

  wordpress:
    image: wordpress:latest
    restart: always
    depends_on:
      - db
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: nika_chinchaladze
      WORDPRESS_DB_PASSWORD: paroli123

volumes:
  db_data:
      `;

      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, 'docker-compose.yml');

      // Write to the docker-compose.yml file in the current directory
      await fs.promises.writeFile(filePath, dockerComposeYml.trim());
      console.log('docker-compose.yml file created.');

      // Step 2: Start Docker services
      console.log('Starting Docker services...');
      await execAsync('docker-compose up -d', { cwd: __dirname });
      console.log('Docker services started.');

      // Step 3: Wait for the services to be ready
      console.log('Waiting for services to be ready...');
      await this.sleep(1000); // Adjust sleep time if necessary

      // Step 4: Get Docker container name
      console.log('Retrieving WordPress container name...');
      const { stdout } = await execAsync('docker ps --filter "ancestor=wordpress" --format "{{.Names}}"');
      const wordpressContainerName = stdout.trim();
      console.log(`WordPress container name: ${wordpressContainerName}`);

      // Step 5: Install necessary packages inside the container
      console.log('Updating packages and installing curl...');
      await execAsync(`docker exec ${wordpressContainerName} apt-get update`);
      await execAsync(`docker exec ${wordpressContainerName} apt-get install -y curl`);

      // Step 6: Install WP-CLI
      console.log('Downloading WP-CLI...');
      await execAsync(`docker exec ${wordpressContainerName} curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar`);
      await execAsync(`docker exec ${wordpressContainerName} chmod +x wp-cli.phar`);
      await execAsync(`docker exec ${wordpressContainerName} mv wp-cli.phar /usr/local/bin/wp`);
      console.log('WP-CLI installed.');
      await this.sleep(1000);
      // Step 7: Check if wp-config.php exists
      console.log('Checking for existing wp-config.php...');
      const checkConfigCmd = `docker exec ${wordpressContainerName} ls /var/www/html/wp-config.php`;
      try {
        await execAsync(checkConfigCmd);
        console.log('wp-config.php exists. Removing...');
        await execAsync(`docker exec ${wordpressContainerName} rm /var/www/html/wp-config.php`);
        console.log('wp-config.php removed.');
      } catch (error) {
        console.log('wp-config.php does not exist. No need to remove.');
      }
      await this.sleep(6000);
      // Step 8: Generate new wp-config.php using WP-CLI
      console.log('Creating new wp-config.php...');
      await execAsync(`docker exec ${wordpressContainerName} wp config create --dbname=ramedb --dbuser=nika_chinchaladze --dbpass=paroli123 --dbhost=db --path=/var/www/html --allow-root`);
      console.log('wp-config.php created.');
      
      // Step 9: Install WordPress
      console.log('Installing WordPress...');
      await execAsync(`docker exec ${wordpressContainerName} wp core install --url="http://localhost:8000" --title="Your Site Title" --admin_user="admin" --admin_password="adminpass" --admin_email="admin@example.com" --skip-email --allow-root`);
      await this.sleep(1000);
      // Step 10: Install and activate language
      console.log('Installing and activating language...');
      await execAsync(`docker exec ${wordpressContainerName} wp language core install en_US --activate --allow-root`);
      await this.sleep(1000);
      console.log('WordPress setup complete!');
      return 'WordPress setup complete!';
      
    } catch (error) {
      console.error('Error during WordPress setup:', error);
      throw new Error('WordPress setup failed');
    }
  }

  // Helper function to introduce delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
