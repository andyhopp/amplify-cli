import { FunctionTemplateParameters, ContributionRequest } from 'amplify-function-plugin-interface';
import { templateRoot } from '../utils/constants';
import path from 'path';
import { askEventSourceQuestions } from '../utils/eventSourceWalkthrough';
import { shimSourceFiles, shimMappings } from './shimProvider';

const pathToTemplateFiles = path.join(templateRoot, 'lambda');
const templateFolder = 'Trigger';

export async function provideTrigger(request: ContributionRequest, context: any): Promise<FunctionTemplateParameters> {
  const eventSourceAnswers: any = await askEventSourceQuestions(context);
  const templateFile = path.join(templateFolder, eventSourceAnswers.triggerEventSourceMappings[0].functionTemplateName as string);
  const handlerSource = path.join('src', request.contributionContext.functionName, `${request.contributionContext.functionName}.cs`);
  let eventFile;
  switch (eventSourceAnswers.triggerEventSourceMappings[0].functionTemplateType) {
    case 'kinesis':
      eventFile = path.join(templateFolder, 'event.kinesis.json');
      break;
    case 'dynamoDB':
      eventFile = path.join(templateFolder, 'event.dynamodb.json');
      break;
    default:
      throw new Error(`Unknown template type ${eventSourceAnswers.triggerEventSourceMappings[0].functionTemplateType}`);
  }
  const files = [
    templateFile,
    'Trigger/aws-lambda-tools-defaults.json.ejs',
    'Trigger/Function.csproj.ejs',
    eventFile,
    ...shimSourceFiles(),
  ];
  return {
    triggerEventSourceMappings: eventSourceAnswers.triggerEventSourceMappings,
    dependsOn: eventSourceAnswers.dependsOn,
    functionTemplate: {
      sourceRoot: pathToTemplateFiles,
      sourceFiles: files,
      destMap: {
        [templateFile]: handlerSource,
        'Trigger/aws-lambda-tools-defaults.json.ejs': path.join(
          'src',
          request.contributionContext.functionName,
          'aws-lambda-tools-defaults.json',
        ),
        'Trigger/Function.csproj.ejs': path.join(
          'src',
          request.contributionContext.functionName,
          `${request.contributionContext.functionName}.csproj`,
        ),
        [eventFile]: path.join('src', 'event.json'),
        ...shimMappings(),
      },
      defaultEditorFile: handlerSource,
    },
  };
}
