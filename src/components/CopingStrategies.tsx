import React, { useEffect, useState } from 'react';
import { getCopingStrategies } from '@/utils/gemini';
import './CopingStrategies.css';

interface Strategy {
  title: string;
  description: string;
  steps: string[];
  category: string;
}

interface CopingStrategiesProps {
  currentEmotion: string;
  intensity: number;
  sessionData: any[];
  messages: { text: string; isUser: boolean }[];
}

const CopingStrategies: React.FC<CopingStrategiesProps> = ({
  currentEmotion,
  intensity,
  messages
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStrategies = async () => {
      setLoading(true);
      try {
        // Get last 5 messages for context
        const recentMessages = messages.slice(-5);
        const newStrategies = await getCopingStrategies(
          currentEmotion,
          intensity,
          recentMessages
        );
        setStrategies(newStrategies);
      } catch (error) {
        console.error('Error fetching strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentEmotion && messages.length > 0) {
      fetchStrategies();
    }
  }, [currentEmotion, intensity, messages]);

  if (loading) {
    return (
      <div className="coping-strategies">
        <h3 className="strategies-title">
          Analyzing conversation for personalized strategies...
        </h3>
      </div>
    );
  }

  if (!strategies.length) {
    return null;
  }

  return (
    <div className="coping-strategies">
      <h3 className="strategies-title">
        Personalized Coping Strategies
      </h3>
      <div className="strategies-container">
        {strategies.map((strategy, index) => (
          <div key={index} className="strategy-card">
            <h4 className="strategy-title">{strategy.title}</h4>
            <p className="strategy-description">{strategy.description}</p>
            <div className="strategy-steps">
              {strategy.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="strategy-step">
                  <span className="step-number">{stepIndex + 1}</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
            <div className="strategy-category">
              Category: {strategy.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CopingStrategies;
