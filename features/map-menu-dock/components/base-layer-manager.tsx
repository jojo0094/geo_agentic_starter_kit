import React, { useState } from 'react';
import { Check, Map, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
        Popover,
        PopoverContent,
        PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BaseLayerManagerProps {
        onLayerSwitch: (layerType: 'osm' | 'satellite') => void;
        activeButton?: string | null;
        onActiveButtonChange?: (button: string | null) => void;
}

export function BaseLayerManager({
        onLayerSwitch,
        activeButton,
        onActiveButtonChange,
}: BaseLayerManagerProps) {
        const [activeBaseLayer, setActiveBaseLayer] = useState<'osm' | 'satellite'>('osm');
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);

        const baseLayerOptions = [
                {
                        id: 'osm' as const,
                        name: 'OpenStreetMap',
                        description: 'Standard street map with detailed road networks',
                        icon: Map,
                        color: 'text-blue-600 dark:text-blue-400',
                },
                {
                        id: 'satellite' as const,
                        name: 'Satellite',
                        description: 'High-resolution satellite imagery',
                        icon: Satellite,
                        color: 'text-green-600 dark:text-green-400',
                },
        ];

        const handleLayerSelect = (layerType: 'osm' | 'satellite') => {
                setActiveBaseLayer(layerType);
                onLayerSwitch(layerType);
        };

        const handlePopoverChange = (open: boolean) => {
                setIsPopoverOpen(open);
                if (onActiveButtonChange) {
                        onActiveButtonChange(open ? 'base-layers' : null);
                }
        };

        return (
                <Popover open={isPopoverOpen} onOpenChange={handlePopoverChange}>
                        <PopoverTrigger asChild>
                                <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                                "h-11 w-11 rounded-xl transition-all duration-300 relative overflow-hidden group",
                                                "hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                                        )}
                                        title="Base Layer Manager"
                                >
                                        <Map
                                                className={cn(
                                                        "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                                                        activeButton === 'base-layers' ? "text-purple-500" : "text-slate-600 dark:text-slate-400"
                                                )}
                                        />
                                        {activeButton === 'base-layers' && (
                                                <motion.div
                                                        layoutId="activeIndicator"
                                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-purple-500 rounded-full"
                                                />
                                        )}
                                        <span className="sr-only">Base Layer Manager</span>
                                </Button>
                        </PopoverTrigger>
                        <PopoverContent
                                className="w-[320px] p-0 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-800/80 overflow-hidden"
                                align="center"
                                side="top"
                                sideOffset={16}
                        >
                                <div className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 p-5">
                                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                                <Map className="h-4 w-4" />
                                                <span>Base Layers</span>
                                        </h3>

                                        <div className="space-y-2">
                                                {baseLayerOptions.map((layer) => {
                                                        const IconComponent = layer.icon;
                                                        const isActive = activeBaseLayer === layer.id;

                                                        return (
                                                                <motion.div
                                                                        key={layer.id}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                >
                                                                        <button
                                                                                onClick={() => handleLayerSelect(layer.id)}
                                                                                className={cn(
                                                                                        "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left group",
                                                                                        isActive
                                                                                                ? "border-purple-300 dark:border-purple-600 bg-purple-100/80 dark:bg-purple-900/30 shadow-md"
                                                                                                : "border-transparent bg-white/80 dark:bg-slate-800/80 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-slate-700/50"
                                                                                )}
                                                                        >
                                                                                <div className="flex items-start justify-between">
                                                                                        <div className="flex items-start gap-3 flex-1">
                                                                                                <div className={cn(
                                                                                                        "p-2 rounded-md transition-colors",
                                                                                                        isActive
                                                                                                                ? "bg-purple-200 dark:bg-purple-800"
                                                                                                                : "bg-slate-100 dark:bg-slate-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900"
                                                                                                )}>
                                                                                                        <IconComponent className={cn(
                                                                                                                "h-4 w-4 transition-colors",
                                                                                                                isActive ? layer.color : "text-slate-500 dark:text-slate-400"
                                                                                                        )} />
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                        <div className={cn(
                                                                                                                "font-medium text-sm transition-colors",
                                                                                                                isActive
                                                                                                                        ? "text-purple-700 dark:text-purple-300"
                                                                                                                        : "text-slate-700 dark:text-slate-300"
                                                                                                        )}>
                                                                                                                {layer.name}
                                                                                                        </div>
                                                                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                                                                                {layer.description}
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>

                                                                                        <div className={cn(
                                                                                                "ml-3 transition-all duration-200",
                                                                                                isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"
                                                                                        )}>
                                                                                                <div className="p-1 rounded-full bg-purple-500">
                                                                                                        <Check className="h-3 w-3 text-white" />
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        </button>
                                                                </motion.div>
                                                        );
                                                })}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-purple-200/50 dark:border-purple-700/30">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <div className="h-1 w-1 rounded-full bg-purple-400"></div>
                                                        <span>Active: {baseLayerOptions.find(l => l.id === activeBaseLayer)?.name}</span>
                                                </div>
                                        </div>
                                </div>
                        </PopoverContent>
                </Popover>
        );
}
