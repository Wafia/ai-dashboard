import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tools } from '../data/tools';
import { AI_PROVIDERS } from '../data/providers';
import ToolLayout from '../components/ToolLayout';
import WafiaAdsMaster from './WafiaAdsMaster';
import AvatarsGenerator from './AvatarsGenerator';
import CreativeStudio from './CreativeStudio';
import AdProVision from './AdProVision';
import AdFusion from './AdFusion';
import PoseCraft from './PoseCraft';
import AngleCraft from './AngleCraft';
import WearCraft from './WearCraft';
import AdScriptStudio from './AdScriptStudio';
import SawtDZ from './SawtDZ';
import ImageGenerator from './ImageGenerator';
import ToolComingSoon from './ToolComingSoon';

export default function ToolPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const tool = tools.find(t => t.id === toolId);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('deepseek/deepseek-v4-flash');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [providerId, setProviderId] = useState(() => localStorage.getItem('current_provider') || 'nvidia');

  useEffect(() => {
    if (!tool) {
      navigate('/', { replace: true });
      return;
    }
    setApiKey('');
    const savedModel = localStorage.getItem(`model_${tool.id}_${providerId}`);
    const savedEndpoint = localStorage.getItem(`custom_endpoint_${tool.id}_${providerId}`);

    const provider = AI_PROVIDERS[providerId];
    const validIds = new Set(provider?.models?.map(m => m.id) || []);
    if (savedModel && validIds.has(savedModel)) setModel(savedModel);
    else setModel(provider?.defaultModel || 'deepseek/deepseek-v4-flash');
    if (savedEndpoint) setCustomEndpoint(savedEndpoint);
    else setCustomEndpoint('');
  }, [toolId, providerId]);

  const handleProviderChange = (newProvider) => {
    setApiKey('');
    setProviderId(newProvider);
    localStorage.setItem('current_provider', newProvider);
  };

  if (!tool) return null;

  const handleApiKeyChange = (key) => {
    const clean = key?.replace(/^["'\s]+|["'\s]+$/g, '') || '';
    setApiKey(clean);
  };

  const handleModelChange = (mdl) => {
    setModel(mdl);
    localStorage.setItem(`model_${tool.id}_${providerId}`, mdl);
  };

  const handleCustomEndpointChange = (ep) => {
    setCustomEndpoint(ep);
    localStorage.setItem(`custom_endpoint_${tool.id}_${providerId}`, ep);
  };

  if (tool.component === 'SawtDZ') {
    return <SawtDZ />;
  }

  const renderTool = () => {
    const toolProps = { apiKey, model, customEndpoint, providerId };
    switch (tool.component) {
      case 'WafiaAdsMaster':
        return <WafiaAdsMaster {...toolProps} />;
      case 'AvatarsGenerator':
        return <AvatarsGenerator {...toolProps} />;
      case 'CreativeStudio':
        return <CreativeStudio {...toolProps} />;
      case 'AdProVision':
        return <AdProVision {...toolProps} />;
      case 'AdFusion':
        return <AdFusion {...toolProps} />;
      case 'PoseCraft':
        return <PoseCraft {...toolProps} />;
      case 'AngleCraft':
        return <AngleCraft {...toolProps} />;
      case 'WearCraft':
        return <WearCraft {...toolProps} />;
      case 'AdScriptStudio':
        return <AdScriptStudio {...toolProps} />;
      case 'ImageGenerator':
        return <ImageGenerator {...toolProps} />;
      default:
        return <ToolComingSoon toolId={toolId} />;
    }
  };

  const providerOverride = AI_PROVIDERS[providerId] || AI_PROVIDERS.nvidia;

  return (
    <ToolLayout
      tool={tool}
      apiKey={apiKey}
      model={model}
      customEndpoint={customEndpoint}
      onApiKeyChange={handleApiKeyChange}
      onModelChange={handleModelChange}
      onCustomEndpointChange={handleCustomEndpointChange}
      providerOverride={providerOverride}
      providerId={providerId}
      onProviderChange={handleProviderChange}
    >
      {renderTool()}
    </ToolLayout>
  );
}
