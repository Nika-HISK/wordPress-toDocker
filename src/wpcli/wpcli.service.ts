import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as shellEscape from 'shell-escape';
import { promises as fs } from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class WpCliService {
  private async getContainerName(): Promise<string> {
    const { stdout } = await execAsync(
      'docker ps --filter "ancestor=wordpress" --format "{{.Names}}"',
    );
    return stdout.trim();
  }

  async execWpCli(command: string): Promise<string> {
    const blockedCommands = ['eval', 'eval-file'];
    const subCommand = command.split(' ')[0];
    if (blockedCommands.includes(subCommand)) {
      throw new HttpException('Command not allowed', HttpStatus.FORBIDDEN);
    }

    const containerName = await this.getContainerName();
    const escapedCommand = shellEscape(command.split(' '));

    try {
      const { stdout, stderr } = await execAsync(
        `docker exec ${containerName} wp ${escapedCommand} --allow-root`,
      );
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      if (error.message.includes('already deactivated')) {
        return 'Maintenance mode is already deactivated.';
      }
      console.error(`Command execution failed: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async wpCacheAdd(key: string, data: string, group: string): Promise<string> {
    return this.execWpCli(`cache add ${key} "${data}" ${group}`);
  }

  async installPackage(packageName: string): Promise<string> {
    return this.execWpCli(`package install ${packageName} --allow-root`);
  }
  async wpCap(subCommand: string, args: string): Promise<string> {
    //ar mushaobs
    return this.execWpCli(`cap ${subCommand} ${args}`);
  }

  async wpCapAdd(role: string, capability: string): Promise<string> {
    const containerName = await this.getContainerName();
    const command = `docker exec ${containerName} wp cap add ${role} ${capability} --allow-root`;

    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      console.error(`Command execution failed: ${error.message}`);
      throw new Error(`Failed to add capability: ${error.message}`);
    }
  }

  async wpGetListCaps(role: string): Promise<string> {
    try {
      const containerName = await this.getContainerName();
      const command = `docker exec ${containerName} wp cap list ${role} --format=json --allow-root`;
      console.log(`Running command: ${command}`);

      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }

      if (stdout) {
        console.log(`WP-CLI stdout: ${stdout}`);
        return stdout.trim();
      }

      throw new Error('No output received from WP-CLI command.');
    } catch (error) {
      throw new Error(`Failed to get capabilities: ${error.message}`);
    }
  }

  async wpCapDelete(roleName: string, cap: string): Promise<string> {
    console.log('Received role name and capibility:', roleName, cap);

    const containerName = await this.getContainerName();
    const command = `cap remove ${roleName} ${cap}`;
    const escapedCommand = shellEscape(command.split(' '));
    const execCommand = `docker exec ${containerName} wp ${escapedCommand} --allow-root`;

    try {
      const result = await execAsync(execCommand);
      console.log('Command executed successfully:', result.stdout);
      return result.stdout;
    } catch (error) {
      console.error('Command execution failed:', error.message);
      throw new InternalServerErrorException(
        `Failed to delete role: ${error.message}`,
      );
    }
  }

  async wpCache(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`cache ${subCommand} ${args}`);
  }

  async wpExports(path: string): Promise<string> {
    const wpUser = 'www-data'; // User that the WordPress installation runs as

    const siteName = await this.getSiteName();

    console.log(siteName);

    const date = this.getDate();

    console.log(date);

    const exportFilePath = `/tmp/${siteName}.wordpress.${date}.xml`;

    console.log(exportFilePath);

    // Export command without the --output parameter, but with output redirection
    const exportCommand = `docker exec -u ${wpUser} wp-wordpress-1 wp export > ${exportFilePath}`;
    const cpCommand = `docker cp wp-wordpress-1:${exportFilePath} ${path}`;

    try {
      // Execute the export command
      await execAsync(exportCommand);

      // Then copy the file to the host
      await execAsync(cpCommand);

      return `Export completed at ${path}`;
    } catch (error) {
      throw new Error(`Failed to export WordPress content: ${error.message}`);
    }
  }

  async wpUserGenerate(count: number): Promise<string> {
    const containerName = await this.getContainerName();
    const command = `user generate --count=${count} --allow-root`;
    const escapedContainerName = shellEscape([containerName]);

    const execCommand = `docker exec ${escapedContainerName} wp ${command}`;

    try {
      const result = await execAsync(execCommand);
      console.log('Command executed successfully:', result.stdout);
      return result.stdout;
    } catch (error) {
      console.error('Command execution failed:', error.message);
      throw new InternalServerErrorException(
        `Failed to generate user: ${error.message}`,
      );
    }
  }

  async wpUserSorted(args: string): Promise<string> {
    const containerName = await this.getContainerName();
    const command = `user list ${args} --order=ASC --orderby=ID --fields=ID,user_login,user_email,display_name,user_registered,roles --allow-root`;
    const escapedContainerName = shellEscape([containerName]);

    const execCommand = `docker exec ${escapedContainerName} wp ${command}`;

    try {
      const result = await execAsync(execCommand);
      console.log('Command executed successfully:', result.stdout);
      return result.stdout;
    } catch (error) {
      console.error('Command execution failed:', error.message);
      throw new InternalServerErrorException(
        `Failed to generate user: ${error.message}`,
      );
    }
  }

  async wpUserCreate(
    username: string,
    email: string,
    password: string,
    displayName: string,
  ): Promise<string> {
    const containerName = await this.getContainerName();

    // Constructing the WP-CLI command
    const command = `user create ${username} ${email} --user_pass=${password} --display_name="${displayName}" --allow-root`;

    const execCommand = `docker exec ${containerName} wp ${command}`;

    try {
      const result = await execAsync(execCommand);
      console.log('User created successfully:', result.stdout);
      return result.stdout;
    } catch (error) {
      console.error('Command execution failed:', error.message);
      throw new InternalServerErrorException(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  async wpImport(args: string): Promise<string> {
    const containerName = await this.getContainerName();

    const checkPluginCommand = `docker exec ${containerName} wp plugin is-installed wordpress-importer --allow-root`;

    try {
      await execAsync(checkPluginCommand);
    } catch (error) {
      console.log('WordPress Importer not installed, installing now...');
      const installCommand = `docker exec ${containerName} wp plugin install wordpress-importer --activate --allow-root`;
      await execAsync(installCommand);
    }

    const importCommand = `docker exec ${containerName} wp import ${args} --allow-root`;
    try {
      const { stdout, stderr } = await execAsync(importCommand);
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      console.error(`Command failed: ${importCommand}`);
      throw new Error(`Failed to import: ${error.message}`);
    }
  }

  async importMedia(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const uploadsDir = path.join(__dirname, '../wp/uploads');
    const localFilePath = path.join(uploadsDir, file.originalname);
    const containerName = await this.getContainerName();
    const containerFilePath = `/var/www/html/wp-content/uploads/${file.originalname}`;

    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(localFilePath, file.buffer);
      if (!containerName) {
        throw new Error('Container name is undefined');
      }
      await execAsync(
        `docker cp "${localFilePath}" "${containerName}:${containerFilePath}"`,
      );
      await execAsync(
        `docker exec ${containerName} wp media import "${containerFilePath}" --allow-root`,
      );

      return `Successfully imported ${file.originalname} as attachment.`;
    } catch (error) {
      throw new HttpException(
        `Failed to import media: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  async importContent(file: Express.Multer.File): Promise<string> {
    if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const uploadsDir = path.join(__dirname, '../wp/imports');
    const localFilePath = path.join(uploadsDir, file.originalname);
    const containerName = await this.getContainerName();
    const containerFilePath = `/var/www/html/wp-content/uploads/${file.originalname}`;

    try {
        // Ensure the uploads directory exists
        await fs.mkdir(uploadsDir, { recursive: true });
        // Write the uploaded file to the local uploads directory
        await fs.writeFile(localFilePath, file.buffer);

        if (!containerName) {
            throw new Error('Container name is undefined');
        }

        // Copy the file to the Docker container
        await execAsync(`docker cp "${localFilePath}" "${containerName}:${containerFilePath}"`);

        // Execute the WP CLI command to import the XML file
        await execAsync(
            `docker exec ${containerName} wp import "${containerFilePath}" --authors=skip --allow-root `
        );

        return `Successfully imported content from ${file.originalname}.`;
    } catch (error) {
        throw new HttpException(
            `Failed to import content: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}


  async wpLanguage(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`language core ${subCommand} ${args}`);
  }

  async wpGetInstalledLanguages(): Promise<string> {
    try {
      const containerName = await this.getContainerName();
      const { stdout, stderr } = await execAsync(
        `docker exec ${containerName} wp language core list --status=installed --format=json --allow-root`,
      );
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get installed languages: ${error.message}`);
    }
  }

  async wpGetMaintenanceStatus(): Promise<string> {
    return this.execWpCli('maintenance-mode status');
  }

  async wpGetAllLanguages(): Promise<string> {
    try {
      const containerName = await this.getContainerName();
      const { stdout, stderr } = await execAsync(
        `docker exec ${containerName} wp language core list  --format=json --allow-root`,
      );
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get installed languages: ${error.message}`);
    }
  }

  async wpLanguageInstall(language: string): Promise<string> {
    return this.execWpCli(`language core install ${language}`);
  }

  async wpLanguageUninstall(language: string): Promise<string> {
    return this.execWpCli(`language core uninstall ${language}`);
  }

  async wpSetLanguage(language: string): Promise<string> {
    return this.execWpCli(`option update WPLANG "${language}"`);
  }

  async wpMaintenance(mode: 'enable' | 'disable'): Promise<string> {
    const subCommand = mode === 'enable' ? 'activate' : 'deactivate';
    return this.execWpCli(`maintenance-mode ${subCommand}`);
  }

  async wpMedia(subCommand: string, args: string): Promise<string> {
    if (subCommand === 'image-size') {
      return this.execWpCli(`media image-size --allow-root`);
    }
    return this.execWpCli(`media ${subCommand} ${args}`);
  }

  async wpOption(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`option ${subCommand} ${args}`);
  }

  async getOption(optionName: string): Promise<string> {
    return this.execWpCli(`option get ${optionName}`);
  }

  async wpPlugin(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`plugin ${subCommand} ${args}`);
  }

  async wpProfile(args: string): Promise<string> {
    return this.execWpCli(`profile ${args}`);
  }

  async wpSearchReplace(oldValue: string, newValue: string): Promise<string> {
    const containerName = await this.getContainerName();
    const command = `docker exec ${containerName} wp search-replace "${oldValue}" "${newValue}"  --skip-columns=guid --allow-root`
    await execAsync(command);

    try {   
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      console.error(`Command execution failed: ${error.message}`);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  async wpTheme(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`theme ${subCommand} ${args}`);
  }

  async wpUserOnlyRoles(field: string, args: string): Promise<string> {
    const containerName = await this.getContainerName();
    const command = `docker exec ${containerName} wp user list ${field} "${args}" --allow-root`;

    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      console.error(`Command execution failed: ${error.message}`);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  async wpUserDelete(userName: string): Promise<string> {
    const containerName = await this.getContainerName();
    const command = `docker exec ${containerName} wp user delete ${userName} --yes --allow-root`;

    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      console.error(`Command execution failed: ${error.message}`);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  async wpUser(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`user ${subCommand} ${args}`);
  }

  async wpRole(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`role ${subCommand} ${args}`);
  }

  async wpRoleCreate(roleName: string, displayName: string): Promise<string> {
    const containerName = await this.getContainerName();
    const command = `docker exec ${containerName} wp role create ${roleName} "${displayName}" --allow-root`;

    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
      console.error(`Command execution failed: ${error.message}`);
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  async wpGetRoles(): Promise<string> {
    try {
      const containerName = await this.getContainerName();
      const command = `docker exec ${containerName} wp role list --format=json --allow-root`;
      console.log(`Running command: ${command}`);

      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }

      if (stdout) {
        console.log(`WP-CLI stdout: ${stdout}`);
        return stdout.trim();
      }

      throw new Error('No output received from WP-CLI command.');
    } catch (error) {
      throw new Error(`Failed to get roles: ${error.message}`);
    }
  }

  async wpDeleteRoles(roleName: string): Promise<string> {
    // Log the received role name
    console.log('Received role name:', roleName);

    // Construct the command
    const command = `role delete ${roleName}`;
    const execCommand = `docker exec wp-wordpress-1 wp ${command} --allow-root`;

    try {
      // Execute the command
      const result = await execAsync(execCommand);
      console.log('Command executed successfully:', result.stdout);
      return result.stdout;
    } catch (error) {
      // Log and throw a new error if the command fails
      console.error('Command execution failed:', error.message);
      throw new InternalServerErrorException(
        `Failed to delete role: ${error.message}`,
      );
    }
  }

  async wpPost(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`post ${subCommand} ${args}`);
  }
  async wpAdmin(): Promise<string> {
    return this.execWpCli('admin');
  }

  async wpCli(subCommand: string): Promise<string> {
    return this.execWpCli(`cli ${subCommand}`);
  }

  async wpComment(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`comment ${subCommand} ${args}`);
  }

  async wpConfig(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`config ${subCommand} ${args}`);
  }

  async wpCore(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`core ${subCommand} ${args}`);
  }

  async wpCron(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`cron ${subCommand} ${args}`);
  }

  async wpDb(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`db ${subCommand} ${args}`);
  }

  async wpDistArchive(args: string): Promise<string> {
    return this.execWpCli(`dist-archive ${args}`);
  }

  async wpEmbed(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`embed ${subCommand} ${args}`);
  }

  async wpEval(code: string): Promise<string> {
    return this.execWpCli(`eval "${code}"`);
  }

  async wpEvalFile(filePath: string): Promise<string> {
    return this.execWpCli(`eval-file "${filePath}"`);
  }

  async wpFind(): Promise<string> {
    return this.execWpCli('find');
  }

  async wpHelp(command?: string): Promise<string> {
    const helpCommand = command ? `help ${command}` : 'help';
    return this.execWpCli(helpCommand);
  }

  async wpI18n(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`i18n ${subCommand} ${args}`);
  }

  async wpMenu(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`menu ${subCommand} ${args}`);
  }

  async wpNetwork(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`network ${subCommand} ${args}`);
  }

  async wpPostType(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`post-type ${subCommand} ${args}`);
  }

  async wpRewrite(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`rewrite ${subCommand} ${args}`);
  }

  async wpScaffold(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`scaffold ${subCommand} ${args}`);
  }

  async wpServer(args: string): Promise<string> {
    return this.execWpCli(`server ${args}`);
  }

  async wpShell(): Promise<string> {
    return this.execWpCli('shell');
  }

  async wpSidebar(): Promise<string> {
    return this.execWpCli('sidebar');
  }

  async wpSite(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`site ${subCommand} ${args}`);
  }

  async wpSuperAdmin(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`super-admin ${subCommand} ${args}`);
  }

  async wpTaxonomy(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`taxonomy ${subCommand} ${args}`);
  }

  async wpTerm(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`term ${subCommand} ${args}`);
  }

  async wpTransient(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`transient ${subCommand} ${args}`);
  }

  async wpWidget(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`widget ${subCommand} ${args}`);
  }

  private async getSiteName(): Promise<string> {
    try {
      const siteName = await this.execWpCli('option get blogname');
      return siteName;
    } catch (error) {
      console.error(`Failed to retrieve site name: ${error.message}`);
      throw new InternalServerErrorException('Could not retrieve site name');
    }
  }

  private getDate(): string {
    const now = new Date();

    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.000`;

    return formattedDate;
  }
}
