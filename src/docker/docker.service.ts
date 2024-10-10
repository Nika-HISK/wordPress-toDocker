import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DockerService {
  generateNginxConfig(projectPath: string, siteName: string): void {
    const nginxConfigPath = path.join(projectPath, 'nginx.conf');
    const nginxConfigContent = `
server {
    listen 80;
    server_name ${siteName}.localhost;

    location / {
        proxy_pass http://wordpress:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;
    fs.writeFileSync(nginxConfigPath, nginxConfigContent);
    console.log(`Nginx configuration created at: ${nginxConfigPath}`);
  }
}
