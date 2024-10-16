import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as unzipper from 'unzipper';
import { CreateWordPressDto } from './wp.interface';
import { DockerService } from 'src/docker/docker.service';

@Injectable()
export class WpService {
  constructor(private readonly dockerService: DockerService) {}

  async createWordPress(
    createWordPressDto: CreateWordPressDto,
    file: Express.Multer.File,
  ) {
    const {
      siteName,
      adminUser,
      adminPassword,
      dbName,
      dbUser,
      dbPassword,
      language,
    } = createWordPressDto;

    const projectPath = path.join(__dirname, '..', 'projects', siteName);
    const dockerfilePath = path.join(projectPath, 'Dockerfile');
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml');
    const wordpressDir = path.join(projectPath, 'wordpress');

    this.createDirectory(projectPath);

    try {
      if (file) {
        const extractedPath = await this.extractWordPress(file, projectPath);
        console.log(`Extracted WordPress files to: ${extractedPath}`);

        const nestedWordpressDir = path.join(extractedPath, 'wordpress');
        if (fs.existsSync(nestedWordpressDir)) {
          console.log('Detected nested WordPress folder, adjusting paths...');
          this.moveFilesOutOfNestedFolder(nestedWordpressDir, wordpressDir);
        } else {
          this.createDirectory(wordpressDir);
        }
      } else {
        await this.createFreshWordPress(wordpressDir);
      }

      // Generate and save Docker Compose
      const dockerComposeContent = this.generateDockerComposeFile({
        dbUser,
        dbPassword,
        dbName,
        adminUser,
        adminPassword,
      });
      fs.writeFileSync(dockerComposePath, dockerComposeContent);

      // Generate and save Dockerfile
      const dockerFileContent = this.generateDockerFile({
        dbUser,
        dbPassword,
        dbName,
        adminUser,
        adminPassword,
      });
      fs.writeFileSync(dockerfilePath, dockerFileContent);

      // Generate and save the NGINX configuration
      const nginxConfigPath = path.join(projectPath, 'nginx.conf');
      const nginxConfigContent = this.generateNginxConfig();
      fs.writeFileSync(nginxConfigPath, nginxConfigContent);

      // Run Docker Compose
      await this.runDockerCompose(projectPath);

      return { message: 'WordPress installation is being set up!' };
    } catch (error) {
      console.error(`Error during WordPress setup: ${error}`);
      throw error;
    }
  }

  private createDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private moveFilesOutOfNestedFolder(nestedDir: string, targetDir: string) {
    const files = fs.readdirSync(nestedDir);
    for (const file of files) {
      const oldPath = path.join(nestedDir, file);
      const newPath = path.join(targetDir, file);
      fs.renameSync(oldPath, newPath);
    }
    fs.rmdirSync(nestedDir);
  }

  private extractWordPress(
    file: Express.Multer.File,
    projectPath: string,
  ): Promise<string> {
    const extractDir = path.join(projectPath, 'wordpress');
    const tempZipPath = path.join(projectPath, 'temp.zip');

    return new Promise((resolve, reject) => {
      this.createDirectory(extractDir);
      fs.writeFile(tempZipPath, file.buffer, (err) => {
        if (err) {
          console.error(`Error writing temp file: ${err}`);
          return reject(err);
        }

        fs.createReadStream(tempZipPath)
          .pipe(unzipper.Extract({ path: extractDir }))
          .on('close', () => {
            fs.unlink(tempZipPath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`Error deleting temp file: ${unlinkErr}`);
              }
            });
            resolve(extractDir);
          })
          .on('error', (extractErr) => {
            console.error(`Extraction error: ${extractErr}`);
            reject(extractErr);
          });
      });
    });
  }

  private generateDockerFile({
    dbUser,
    dbPassword,
    dbName,
    adminUser,
    adminPassword,
  }): string {
    return `
 # Use the official WordPress image as the base image
FROM wordpress:latest

ARG WORDPRESS_DB_NAME
ARG WORDPRESS_DB_USER
ARG WORDPRESS_DB_PASSWORD
ARG WORDPRESS_DB_HOST

# Install necessary dependencies and WP-CLI
RUN apt-get update && apt-get install -y \\
    less \\
    mariadb-client \\
    curl \\
    sudo \\
    unzip \\
    && rm -rf /var/lib/apt/lists/*

# Download WP-CLI
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar

# Make WP-CLI executable
RUN chmod +x wp-cli.phar

# Move WP-CLI to a directory in the PATH
RUN mv wp-cli.phar /usr/local/bin/wp

RUN echo "Configuring wp-config.php file" && \\
    wp config create \\
        --dbname=${dbName} \\
        --dbuser=${dbUser} \\
        --dbpass=${dbPassword} \\
        --dbhost=db \\
        --path=/var/www/html --allow-root

RUN wp core install --url="http://localhost:8080" \\
    --title="My WordPress Site" \\
    --admin_user="admin" \\
    --admin_password="admin_password" \\
    --admin_email="admin@example.com" --allow-root
    `;
  }

  private generateDockerComposeFile({
    dbUser,
    dbPassword,
    dbName,
    adminUser,
    adminPassword,
  }): string {
    return `
version: '3.8'

services:
  wordpress:
    build: .
    image: wordpress:latest
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: ${dbUser}
      WORDPRESS_DB_PASSWORD: ${dbPassword}
      WORDPRESS_DB_NAME: ${dbName}
      WORDPRESS_ADMIN_USER: ${adminUser}
      WORDPRESS_ADMIN_PASSWORD: ${adminPassword}
    volumes:
      - wordpress_data:/var/www/html

  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: ${dbPassword}
      MYSQL_DATABASE: ${dbName}
      MYSQL_USER: ${dbUser}
      MYSQL_PASSWORD: ${dbPassword}
    volumes:
      - db_data:/var/lib/mysql

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs/nginx.crt:/etc/nginx/ssl/nginx.crt
      - ./certs/nginx.key:/etc/nginx/ssl/nginx.key
    depends_on:
      - wordpress

volumes:
  wordpress_data:
  db_data:
    `;
  }

  private async createFreshWordPress(wordpressDir: string): Promise<void> {
    this.createDirectory(wordpressDir);

    return new Promise((resolve, reject) => {
      exec(
        `curl -o wordpress.zip https://wordpress.org/latest.zip && unzip wordpress.zip -d ${wordpressDir}`,
        { cwd: wordpressDir },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error downloading WordPress: ${stderr}`);
            reject(error);
            return;
          }
          console.log(`WordPress downloaded and extracted to: ${wordpressDir}`);
          resolve();
        },
      );
    });
  }

  private async runDockerCompose(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `docker-compose up -d`,
        { cwd: projectPath },
        (error, stdout, stderr) => {
          if (error) {
            reject(`Error running Docker Compose: ${stderr}`);
            return;
          }
          resolve();
        },
      );
    });
  }

  private generateNginxConfig(): string {
    return `
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://wordpress:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
    `;
  }
}
