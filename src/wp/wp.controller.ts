import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as unzipper from 'unzipper'; // Make sure to install unzipper

@Controller('create')
export class WpController {
  @Post()
  @UseInterceptors(FileInterceptor('file')) // Accept file uploads
  async createWordPress(
    @Body() createWordPressDto: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const { siteName, adminUser, adminPassword, dbName, dbUser, dbPassword } = createWordPressDto;

    // Define the project path for Docker Compose setup
    const projectPath = path.join(__dirname, '..', 'projects', siteName);
    const dockerComposePath = path.join(projectPath, 'docker-compose.yml');

    // Create project directory
    this.createDirectory(projectPath);

    try {
      // Check if the user has uploaded a WordPress folder
      if (file) {
        // Extract and handle the provided WordPress folder
        const extractedPath = await this.extractWordPress(file, projectPath);
        console.log(`Extracted WordPress files to: ${extractedPath}`);
      } else {
        // Create a fresh WordPress installation if no folder was uploaded
        await this.createFreshWordPress(projectPath);
      }

      // Generate and write Docker Compose file
      const dockerComposeContent = this.generateDockerComposeFile({ dbUser, dbPassword, dbName, adminUser, adminPassword });
      fs.writeFileSync(dockerComposePath, dockerComposeContent);

      // Run Docker Compose
      await this.runDockerCompose(projectPath);

      return { message: 'WordPress installation is being set up!' };
    } catch (error) {
      console.error(`Error during WordPress setup: ${error}`);
      throw error; // Optionally, handle the error according to your application's needs
    }
  }

  // Helper method to create a directory
  private createDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Extract the uploaded WordPress folder (if any)
  private extractWordPress(file: Express.Multer.File, projectPath: string): Promise<string> {
    const extractDir = path.join(projectPath, 'wordpress');
    const tempZipPath = path.join(projectPath, 'temp.zip');

    return new Promise((resolve, reject) => {
      // Create extraction directory
      this.createDirectory(extractDir);

      // Write the buffer to a temporary zip file
      fs.writeFile(tempZipPath, file.buffer, (err) => {
        if (err) {
          console.error(`Error writing temp file: ${err}`);
          return reject(err);
        }

        // Extract the zip file
        fs.createReadStream(tempZipPath)
          .pipe(unzipper.Extract({ path: extractDir }))
          .on('close', () => {
            // Delete the temporary zip file after extraction
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

  // Generate Docker Compose file content
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

volumes:
  wordpress_data:
  db_data:
`;
  }

  // Create a fresh WordPress installation (download and configure)
  private async createFreshWordPress(projectPath: string): Promise<void> {
    const wordpressDir = path.join(projectPath, 'wordpress');

    // Automate WordPress download and extraction
    this.createDirectory(wordpressDir);

    return new Promise((resolve, reject) => {
      exec(`curl -o wordpress.zip https://wordpress.org/latest.zip && unzip wordpress.zip -d ${wordpressDir}`, { cwd: projectPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error downloading WordPress: ${stderr}`);
          reject(error);
          return;
        }
        console.log(`WordPress downloaded and extracted to: ${wordpressDir}`);
        resolve();
      });
    });
  }

  // Run Docker Compose
  private runDockerCompose(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`docker-compose up -d`, { cwd: projectPath }, (error, stdout, stderr) => {
        if (error) {
          reject(`Error running Docker Compose: ${stderr}`);
          return;
        }
        resolve();
      });
    });
  }
}
