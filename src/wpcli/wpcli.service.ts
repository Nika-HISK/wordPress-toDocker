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
    const { stdout } = await execAsync(
      `docker exec ${containerName} wp ${command} --allow-root`,
    );
    return stdout;
  }

  async wpCap(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`cap ${subCommand} ${args}`);
  }

  async wpCache(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`cache ${subCommand} ${args}`);
  }

  async wpExport(args: string): Promise<string> {
    return this.execWpCli(`export ${args}`);
  }

  async wpImport(args: string): Promise<string> {
    return this.execWpCli(`import ${args}`);
  }

  async wpLanguage(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`language ${subCommand} ${args}`);
  }

  async wpMaintenance(mode: 'enable' | 'disable'): Promise<string> {
    return this.execWpCli(`maintenance-mode ${mode}`);
  }

  async wpMedia(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`media ${subCommand} ${args}`);
  }

  async wpOption(subCommand: string, args: string): Promise<string> {
    return this.execWpCli(`option ${subCommand} ${args}`);
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
}
