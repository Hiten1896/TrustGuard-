import { analyzeImageForensics } from './ImageEngine';
import { runGeospatialAnalysis } from './GeospatialEngine';
import { runMetadataAnalysis, runQrForensics } from './UtilityEngine';
import { runAudioAnalysis } from './AudioEngine';
import { 
    runNetworkAnalysis, 
    runDocumentAnalysis, 
    runArchiveAnalysis, 
    runSoftwareAnalysis, 
    runTextAnalysis, 
    runVideoAnalysis,
    runSocialAnalysis,
    runHexAnalysis
} from './ForensicEngine';

export async function runModuleAnalysis(module, file, buffer) {
    switch (module) {
        case 'image': return await analyzeImageForensics(file, buffer);
        case 'geospatial': return await runGeospatialAnalysis(file, buffer);
        case 'metadata': return await runMetadataAnalysis(file, buffer);
        case 'qrcode': return await runQrForensics(file, buffer);
        case 'audio': return await runAudioAnalysis(file, buffer);
        case 'social': return await runSocialAnalysis(file, buffer);
        case 'document': return await runDocumentAnalysis(file, buffer);
        case 'archive': return await runArchiveAnalysis(file, buffer);
        case 'software': return await runSoftwareAnalysis(file, buffer);
        case 'text': return await runTextAnalysis(file, buffer);
        case 'video': return await runVideoAnalysis(file, buffer);
        case 'hex': return await runHexAnalysis(file, buffer);
        default: return { fields: {}, verdict: 'clean', verdictLabel: 'Unknown Module' };
    }
}
