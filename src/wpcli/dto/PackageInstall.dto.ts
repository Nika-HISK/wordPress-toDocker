import { IsString, Matches } from 'class-validator';

export class PackageInstallDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Invalid package name' })
  packageName: string;
}