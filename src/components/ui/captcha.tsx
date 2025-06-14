
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify, className }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const operators = ['+', '-', '*'];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    let n1, n2;

    if (randomOperator === '*') {
      n1 = Math.floor(Math.random() * 10) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
    } else {
      n1 = Math.floor(Math.random() * 20) + 1;
      n2 = Math.floor(Math.random() * 20) + 1;
    }

    setNum1(n1);
    setNum2(n2);
    setOperator(randomOperator);
    setUserAnswer('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (userAnswer) {
      const correctAnswer = calculateAnswer();
      const isCorrect = parseInt(userAnswer) === correctAnswer;
      setIsVerified(isCorrect);
      onVerify(isCorrect);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  }, [userAnswer, num1, num2, operator]);

  const calculateAnswer = () => {
    switch (operator) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '*':
        return num1 * num2;
      default:
        return 0;
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="captcha">Security Check</Label>
      <div className="flex items-center space-x-2 mt-2">
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded border">
          <span className="font-mono text-lg">
            {num1} {operator} {num2} = ?
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateCaptcha}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <Input
          id="captcha"
          type="number"
          placeholder="Answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className={`w-20 ${isVerified ? 'border-green-500' : userAnswer ? 'border-red-500' : ''}`}
        />
        {isVerified && <span className="text-green-600 text-sm">✓</span>}
      </div>
    </div>
  );
};
