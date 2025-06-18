import React from 'react';
import { ProcessingStatus as ProcessingStatusType } from '../types';
import { Brain, CheckCircle, Loader } from 'lucide-react';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

export default function ProcessingStatus({ status }: ProcessingStatusProps) {
  const getStageIcon = () => {
    if (status.stage === 'complete') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
  };

  const getStageColor = () => {
    switch (status.stage) {
      case 'complete':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Processing
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          Generating intelligent notes from your transcript
        </p>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {getStageIcon()}
          <span className="font-medium text-gray-900 capitalize">
            {status.message}
          </span>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getStageColor()}`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status.progress >= 20 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={`text-sm ${status.progress >= 20 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
              Analyzing content structure
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status.progress >= 45 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={`text-sm ${status.progress >= 45 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
              Extracting key concepts
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status.progress >= 70 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={`text-sm ${status.progress >= 70 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
              Structuring notes format
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status.progress >= 90 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={`text-sm ${status.progress >= 90 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
              Finalizing output
            </span>
          </div>
        </div>

        {status.stage === 'complete' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-medium text-sm">
                Notes generated successfully!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}