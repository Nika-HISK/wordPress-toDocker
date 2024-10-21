import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { WpCliService } from './wpcli.service';

@Controller('wp-cli')
export class WpCliController {
  constructor(private readonly wpCliService: WpCliService) {}

  @Post('package/install')
  async installPackage(@Body('packageName') packageName: string) {
    return this.wpCliService.installPackage(packageName);
  }

  @Post('cap/:subCommand')
  async wpCap(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpCap(subCommand, args);
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

  @Post('export')
  async wpExport(
    @Body('dir') dir: string,
    @Body('skipComments') skipComments: boolean,
  ) {
    return this.wpCliService.wpExport(dir, skipComments);
  }
  @Post('import')
  async wpImport(@Body('args') args: string) {
    return this.wpCliService.wpImport(args);
  }

  @Post('language/set')
  async wpSetLanguage(@Body('args') args: string) {
    return this.wpCliService.wpSetLanguage(args);
  }

  @Post('language/:subCommand')
  async wpLanguage(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpLanguage(subCommand, args);
  }

  @Post('maintenance/:mode')
  async wpMaintenance(@Param('mode') mode: 'enable' | 'disable') {
    return this.wpCliService.wpMaintenance(mode);
  }

  @Post('media/upload')
  async uploadMedia(@Body('filePath') filePath: string) {
    return this.wpCliService.copyFileToContainer(filePath);
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

  @Post('theme/:subCommand')
  async wpTheme(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpTheme(subCommand, args);
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
}
