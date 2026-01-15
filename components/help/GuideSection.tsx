import { LucideIcon } from "lucide-react";

interface Step {
    title: string;
    description: string;
}

interface GuideSectionProps {
    title: string;
    icon: LucideIcon;
    description: string;
    steps: Step[];
}

export function GuideSection({ title, icon: Icon, description, steps }: GuideSectionProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {description}
            </p>

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold text-sm">
                            {index + 1}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                {step.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
