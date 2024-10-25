import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Delete,
  BadRequestException,
  HttpException,
  HttpStatus,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { WpCliService } from './wpcli.service';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { PackageInstallDto } from './dto/PackageInstall.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Controller('wp-cli')
export class WpCliController {
  constructor(private readonly wpCliService: WpCliService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('package/install')
  async installPackage(@Body() Body: PackageInstallDto) {
    return this.wpCliService.installPackage(Body.packageName);
  }

  @Post('cap-add')
  async addCapability(
    @Body('role') role: string,
    @Body('capability') capability: string,
  ): Promise<string> {
    return this.wpCliService.wpCapAdd(role, capability);
  }

  @Post('cap')
  async wpGetListCaps(@Body('role') role: string) {
    return this.wpCliService.wpGetListCaps(role);
  }

  @Post('cap/delete')
  async wpCapDelete(
    @Body('roleName') roleName: string,
    @Body('cap') cap: string,
  ) {
    return this.wpCliService.wpCapDelete(roleName, cap);
  }

  @Post('cap/:subCommand')
  async wpCap(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpCap(subCommand, args);
  }

  @Get('roles')
  async getRoles(): Promise<string> {
    return this.wpCliService.wpGetRoles();
  }

  @Post('cache/add')
  async wpCacheAdd(
    @Body('key') key: string,
    @Body('data') data: string,
    @Body('group') group: string,
  ) {
    return this.wpCliService.wpCacheAdd(key, data, group);
  }

  @Post('cache/:subCommand')
  async wpCache(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpCache(subCommand, args);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importContent(@UploadedFile() file: Express.Multer.File): Promise<string> {
      if (!file) {
          throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }
      return this.wpCliService.importContent(file);
  }

  @Post('language/set')
  async wpSetLanguage(@Body('args') args: string) {
    return this.wpCliService.wpSetLanguage(args);
  }

  @Get('language/installed')
  async getInstalledLanguages() {
    try {
      const installedLanguages =
        await this.wpCliService.wpGetInstalledLanguages();
      return {
        status: 'success',
        data: installedLanguages,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get('language/all-languages')
  async getAllLanguages() {
    try {
      const installedLanguages = await this.wpCliService.wpGetAllLanguages();
      return {
        status: 'success',
        data: installedLanguages,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Post('language/install')
  async installLanguage(@Body('language') language: string) {
    return this.wpCliService.wpLanguageInstall(language);
  }

  @Post('language/uninstall')
  async uninstallLanguage(@Body('language') language: string) {
    return this.wpCliService.wpLanguageUninstall(language);
  }

  @Post('language/:subCommand')
  async wpLanguage(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpLanguage(subCommand, args);
  }

  @Get('maintenance/status')
  async getMaintenanceStatus() {
    try {
      const status = await this.wpCliService.wpGetMaintenanceStatus();
      return {
        status: 'success',
        data: status,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Post('maintenance/:mode')
  async wpMaintenance(@Param('mode') mode: 'enable' | 'disable') {
    return this.wpCliService.wpMaintenance(mode);
  }

  @Post('media/import')
  @UseInterceptors(FileInterceptor('file'))
  async importMedia(@UploadedFile() file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    return this.wpCliService.importMedia(file);
  }

  @Post('media/:subCommand')
  async wpMedia(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpMedia(subCommand, args);
  }

  @Post('option/:subCommand')
  async wpOption(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpOption(subCommand, args);
  }

  @Post('plugin/:subCommand')
  async wpPlugin(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpPlugin(subCommand, args);
  }

  @Post('profile')
  async wpProfile(@Body('args') args: string) {
    return this.wpCliService.wpProfile(args);
  }

  @Post('search-replace')
  async wpSearchReplace(
    @Body('oldValue') oldValue: string,
    @Body('newValue') newValue: string,
  ) {
    return this.wpCliService.wpSearchReplace(oldValue, newValue);
  }

  @Post('role/create')
  async createRole(
    @Body() body: { roleName: string; displayName: string },
  ): Promise<string> {
    const { roleName, displayName } = body;
    return this.wpCliService.wpRoleCreate(roleName, displayName);
  }

  @Post('roles/delete')
  async wpDeleteRoles(@Body('roleName') roleName: string) {
    console.log('Received role name:', roleName); // Log the received role name for debugging

    if (!roleName) {
      throw new HttpException(
        'Role name must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.wpCliService.wpDeleteRoles(roleName);
      return {
        message: 'Role deleted successfully',
        result: result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('theme/:subCommand')
  async wpTheme(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpTheme(subCommand, args);
  }

  @Post('user/create')
  async createUser(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('displayName') displayName: string
  ): Promise<string> {
    return this.wpCliService.wpUserCreate(username, email, password, displayName);
  }

  @Post('user/generate')
  async wpUserGenerate(@Body('count') count: number) {
    return this.wpCliService.wpUserGenerate(count);
  }

  @Post('user/delete')
  async wpUserDelete(@Body('userName') userName: string) {
    return this.wpCliService.wpUserDelete(userName);
  }

  @Post('user/list/sorted')
  async wpUserSorted(@Body('args') args: string) {
    return this.wpCliService.wpUserSorted(args);
  }

  @Post('user/filtered')
  async wpUserOnlyRoles(
    @Body('field') field: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpUserOnlyRoles(field, args);
  }

  @Post('user/:subCommand')
  async wpUser(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpUser(subCommand, args);
  }

  @Post('role/:subCommand')
  async wpRole(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpRole(subCommand, args);
  }

  @Post('post/:subCommand')
  async wpPost(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpPost(subCommand, args);
  }
  @Post('option/add')
  async wpOptionAdd(@Body('args') args: string) {
    return this.wpCliService.wpOption('add', args);
  }

  @Get('option/get/:optionName')
  async getOption(@Param('optionName') optionName: string) {
    return this.wpCliService.getOption(optionName);
  }
  @Post('admin')
  async wpAdmin() {
    return this.wpCliService.wpAdmin();
  }

  @Post('cli/:subCommand')
  async wpCli(@Param('subCommand') subCommand: string) {
    return this.wpCliService.wpCli(subCommand);
  }

  @Post('comment/:subCommand')
  async wpComment(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpComment(subCommand, args);
  }

  @Post('config/:subCommand')
  async wpConfig(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpConfig(subCommand, args);
  }

  @Post('core/:subCommand')
  async wpCore(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpCore(subCommand, args);
  }

  @Post('cron/:subCommand')
  async wpCron(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpCron(subCommand, args);
  }

  @Post('db/:subCommand')
  async wpDb(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpDb(subCommand, args);
  }

  @Post('dist-archive')
  async wpDistArchive(@Body('args') args: string) {
    return this.wpCliService.wpDistArchive(args);
  }

  @Post('embed/:subCommand')
  async wpEmbed(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpEmbed(subCommand, args);
  }

  @Post('eval')
  async wpEval(@Body('code') code: string) {
    return this.wpCliService.wpEval(code);
  }

  @Post('eval-file')
  async wpEvalFile(@Body('filePath') filePath: string) {
    return this.wpCliService.wpEvalFile(filePath);
  }

  @Get('find')
  async wpFind() {
    return this.wpCliService.wpFind();
  }

  @Get('help/:command?')
  async wpHelp(@Param('command') command?: string) {
    return this.wpCliService.wpHelp(command);
  }

  @Post('i18n/:subCommand')
  async wpI18n(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpI18n(subCommand, args);
  }

  @Post('menu/:subCommand')
  async wpMenu(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpMenu(subCommand, args);
  }

  @Post('network/:subCommand')
  async wpNetwork(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpNetwork(subCommand, args);
  }

  @Post('post-type/:subCommand')
  async wpPostType(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpPostType(subCommand, args);
  }

  @Post('rewrite/:subCommand')
  async wpRewrite(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpRewrite(subCommand, args);
  }

  @Post('scaffold/:subCommand')
  async wpScaffold(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpScaffold(subCommand, args);
  }

  @Post('server')
  async wpServer(@Body('args') args: string) {
    return this.wpCliService.wpServer(args);
  }

  @Post('shell')
  async wpShell() {
    return this.wpCliService.wpShell();
  }

  @Get('sidebar')
  async wpSidebar() {
    return this.wpCliService.wpSidebar();
  }

  @Post('site/:subCommand')
  async wpSite(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpSite(subCommand, args);
  }

  @Post('super-admin/:subCommand')
  async wpSuperAdmin(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpSuperAdmin(subCommand, args);
  }

  @Post('taxonomy/:subCommand')
  async wpTaxonomy(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpTaxonomy(subCommand, args);
  }

  @Post('term/:subCommand')
  async wpTerm(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpTerm(subCommand, args);
  }

  @Post('transient/:subCommand')
  async wpTransient(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpTransient(subCommand, args);
  }

  @Post('widget/:subCommand')
  async wpWidget(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpWidget(subCommand, args);
  }

   @Get('export')
  async exportAndRunFile(@Res() res: Response) {
    return await this.wpCliService.exportAndReturnFile(res); 
  }
}
