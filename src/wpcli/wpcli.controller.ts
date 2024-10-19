import { Controller, Post, Param, Body } from '@nestjs/common';
import { WpCliService } from './wpcli.service';

@Controller('wp-cli')
export class WpCliController {
  constructor(private readonly wpCliService: WpCliService) {}

  @Post('cap/:subCommand')
  async wpCap(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpCap(subCommand, args);
  }

  @Post('cache/:subCommand')
  async wpCache(
    @Param('subCommand') subCommand: string,
    @Body('args') args: string,
  ) {
    return this.wpCliService.wpCache(subCommand, args);
  }

  @Post('export')
  async wpExport(@Body('args') args: string) {
    return this.wpCliService.wpExport(args);
  }

  @Post('import')
  async wpImport(@Body('args') args: string) {
    return this.wpCliService.wpImport(args);
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
}
