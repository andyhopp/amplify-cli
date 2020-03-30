import { FunctionTemplateParameters, ContributionRequest } from 'amplify-function-plugin-interface';
import { templateRoot } from '../utils/constants';
import { shimSourceFiles, shimMappings } from './shimProvider';
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';

const pathToTemplateFiles = path.join(templateRoot, 'lambda');

export function provideServerless(request: ContributionRequest): Promise<FunctionTemplateParameters> {
  const files = [
    'Serverless/aws-lambda-tools-defaults.json.ejs',
    'Serverless/Function.csproj.ejs',
    'Serverless/FunctionHandler.cs.ejs',
    'Serverless/event.json',
    ...shimSourceFiles(),
  ];
  const handlerSource = path.join('src', request.contributionContext.functionName, `${request.contributionContext.functionName}.cs`);
  return Promise.resolve({
    functionTemplate: {
      sourceRoot: pathToTemplateFiles,
      sourceFiles: files,
      parameters: {
        path: '/item',
        expressPath: '/item',
      },
      defaultEditorFile: handlerSource,
      destMap: {
        'Serverless/aws-lambda-tools-defaults.json.ejs': path.join(
          'src',
          request.contributionContext.functionName,
          'aws-lambda-tools-defaults.json',
        ),
        'Serverless/Function.csproj.ejs': path.join(
          'src',
          request.contributionContext.functionName,
          `${request.contributionContext.functionName}.csproj`,
        ),
        'Serverless/FunctionHandler.cs.ejs': handlerSource,
        'Serverless/event.json': path.join('src', 'event.json'),
        ...shimMappings(),
      },
    },
  });
}
