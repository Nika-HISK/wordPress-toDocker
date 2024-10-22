import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as shellEscape from 'shell-escape';

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

  async installPackage(packageName: string): Promise<string> {
    return this.execWpCli(`package install ${packageName} --allow-root`);
  }

  async wpCap(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`cap ${subCommand} ${args}`);
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
    const containerName = await this.getContainerName();

    // Check the current status of maintenance mode
    const { stdout } = await execAsync(
      `docker exec ${containerName} wp maintenance-mode status --allow-root`,
    );

    const isActive = stdout.includes('active');

    if (mode === 'enable' && !isActive) {
      return this.execWpCli(`maintenance-mode activate`);
    } else if (mode === 'disable' && isActive) {
      return this.execWpCli(`maintenance-mode deactivate`);
    }

    return `Maintenance mode is already ${mode === 'enable' ? 'active' : 'inactive'}.`;
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
