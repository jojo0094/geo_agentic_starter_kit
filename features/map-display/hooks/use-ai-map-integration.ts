// hooks/use-ai-map-integration.ts
import { useEffect, useRef } from 'react';
import type { LngLatBoundsLike } from 'maplibre-gl';

interface AIMapIntegrationProps {
        messages: any[]; // Your chat messages array
        onSearchResult: (bounds: LngLatBoundsLike) => void; // Your existing map zoom function
}

export function useAIMapIntegration({ messages, onSearchResult }: AIMapIntegrationProps) {
        const processedMessageIds = useRef<Set<string>>(new Set());

        useEffect(() => {
                // Process new messages for geocoding results
                messages.forEach((message) => {
                        // Skip if already processed
                        if (processedMessageIds.current.has(message.id)) return;

                        // Only process assistant messages with tool calls
                        if (message.role === 'assistant' && message.toolInvocations) {
                                message.toolInvocations.forEach((invocation: any) => {
                                        // Check for successful geocoding tool results
                                        if (invocation.state === 'result' &&
                                                (invocation.toolName === 'geocodeAddress' ||
                                                        invocation.toolName === 'reverseGeocodeCoordinates' ||
                                                        invocation.toolName === 'reverseGeocodeToStructuredAddress')) {

                                                const result = invocation.result;

                                                // Handle geocodeAddress tool result (returns GeoJSON Point Feature)
                                                if (invocation.toolName === 'geocodeAddress' && result.result) {
                                                        const pointFeature = result.result;
                                                        if (pointFeature.geometry && pointFeature.geometry.type === 'Point') {
                                                                const [lng, lat] = pointFeature.geometry.coordinates;
                                                                // Create a small bounding box around the point for zooming
                                                                const padding = 0.01; // Adjust zoom level as needed
                                                                const bounds: LngLatBoundsLike = [
                                                                        [lng - padding, lat - padding],
                                                                        [lng + padding, lat + padding]
                                                                ];
                                                                onSearchResult(bounds);
                                                        }
                                                }

                                                // Handle reverse geocoding tools (they work with coordinates)
                                                if ((invocation.toolName === 'reverseGeocodeCoordinates' ||
                                                        invocation.toolName === 'reverseGeocodeToStructuredAddress') &&
                                                        invocation.args?.coordinates) {
                                                        const [lng, lat] = invocation.args.coordinates;
                                                        const padding = 0.01;
                                                        const bounds: LngLatBoundsLike = [
                                                                [lng - padding, lat - padding],
                                                                [lng + padding, lat + padding]
                                                        ];
                                                        onSearchResult(bounds);
                                                }
                                        }
                                });
                        }

                        // Mark message as processed
                        processedMessageIds.current.add(message.id);
                });
        }, [messages, onSearchResult]);

        // Clean up old message IDs to prevent memory leaks
        useEffect(() => {
                const currentMessageIds = new Set(messages.map(m => m.id));
                processedMessageIds.current = new Set(
                        Array.from(processedMessageIds.current).filter(id => currentMessageIds.has(id))
                );
        }, [messages]);
}

// Alternative: More specific hook for extracting coordinates from messages
export function useExtractCoordinatesFromAI(messages: any[]) {
        const [latestCoordinates, setLatestCoordinates] = useState<[number, number] | null>(null);

        useEffect(() => {
                // Find the most recent geocoding result
                for (let i = messages.length - 1; i >= 0; i--) {
                        const message = messages[i];

                        if (message.role === 'assistant' && message.toolInvocations) {
                                for (const invocation of message.toolInvocations) {
                                        if (invocation.state === 'result') {
                                                // Extract coordinates from geocodeAddress result
                                                if (invocation.toolName === 'geocodeAddress' && invocation.result?.result) {
                                                        const coords = invocation.result.result.geometry?.coordinates;
                                                        if (coords && coords.length >= 2) {
                                                                setLatestCoordinates([coords[0], coords[1]]);
                                                                return; // Found most recent, exit
                                                        }
                                                }

                                                // Extract coordinates from reverse geocoding args
                                                if ((invocation.toolName === 'reverseGeocodeCoordinates' ||
                                                        invocation.toolName === 'reverseGeocodeToStructuredAddress') &&
                                                        invocation.args?.coordinates) {
                                                        const coords = invocation.args.coordinates;
                                                        if (coords && coords.length >= 2) {
                                                                setLatestCoordinates([coords[0], coords[1]]);
                                                                return;
                                                        }
                                                }
                                        }
                                }
                        }
                }
        }, [messages]);

        return latestCoordinates;
}

// Usage in your AIChat component:
/*
// In your AIChat component
import { useAIMapIntegration } from '@/hooks/use-ai-map-integration';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchResult: (bounds: LngLatBoundsLike) => void; // Add this prop
}

export function AIChat({ isOpen, onClose, onSearchResult }: AIChatProps) {
  // Your existing useChat hook
  const { messages, ... } = useChat({...});
  
  // Add the map integration hook
  useAIMapIntegration({ 
    messages, 
    onSearchResult 
  });
  
  // Rest of your component...
}
*/
