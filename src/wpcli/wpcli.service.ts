import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class WpCliService {
  private async getContainerName(): Promise<string> {
    const { stdout } = await execAsync(
      'docker ps --filter "ancestor=wordpress" --format "{{.Names}}"',
    );
    return stdout.trim();
  }

  private async execWpCli(command: string): Promise<string> {
    const containerName = await this.getContainerName();
    try {
      const { stdout, stderr } = await execAsync(
        `docker exec ${containerName} wp ${command} --allow-root`,
      );
      if (stderr) {
        console.warn(`WP-CLI stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error) {
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
  async wpCap(subCommand: string, args: string): Promise<string> { //ar mushaobs
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


  async wpCache(subCommand: string, args: string): Promise<string> { 
    return this.execWpCli(`cache ${subCommand} ${args}`);
  }

  async wpExport(
    dir: string = '/tmp',
    skipComments: boolean = false,
  ): Promise<string> {
    const skipCommentsFlag = skipComments ? '--skip_comments' : '';    
    return this.execWpCli(`export --dir=${dir} ${skipCommentsFlag}`.trim());
  }

  async copyFileToContainer(filePath: string): Promise<string> {
    const containerName = await this.getContainerName();
    const targetPath = '/tmp/' + filePath.split('\\').pop();
    const command = `docker cp "${filePath}" ${containerName}:${targetPath}`;

    try {
      await execAsync(command);
      return `File copied to ${targetPath}`;
    } catch (error) {
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  async wpImport(args: string): Promise<string> {
    return this.execWpCli(`import ${args}`);
  }

  async wpLanguage(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`language core ${subCommand} ${args}`);
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
    return this.execWpCli(`search-replace "${oldValue}" "${newValue}"`);
  }

  async wpTheme(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`theme ${subCommand} ${args}`);
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
}
