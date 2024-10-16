import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class DockerService {
  // Basic implementation to run Docker commands
  runCommand(command: string, workingDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: workingDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running Docker command: ${stderr}`);
          return reject(error);
        }
        console.log(`Docker command output: ${stdout}`);
        resolve();
      });
    });
  }
}
