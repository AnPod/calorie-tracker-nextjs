'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Flame, User, Target } from 'lucide-react';
import { calculateMaintenanceCalories, type Gender } from '@/lib/tdee-calculator';

type Step = 'welcome' | 'profile' | 'confirm';

const STEPS: Step[] = ['welcome', 'profile', 'confirm'];

interface ProfileData {
  age: string;
  gender: Gender | '';
  weightKg: string;
  heightCm: string;
}

const STORAGE_KEY = 'onboarding_progress';

function loadProgress(): { step: Step; data: ProfileData } {
  if (typeof window === 'undefined') {
    return { step: 'welcome', data: { age: '', gender: '', weightKg: '', heightCm: '' } };
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return { step: 'welcome', data: { age: '', gender: '', weightKg: '', heightCm: '' } };
}

function saveProgress(step: Step, data: ProfileData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
  } catch {
    // ignore
  }
}

function clearProgress() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    gender: '',
    weightKg: '',
    heightCm: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedGoal, setCalculatedGoal] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadProgress();
    setCurrentStep(saved.step);
    setProfileData(saved.data);
  }, []);

  const currentStepIndex = STEPS.indexOf(currentStep);

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
    saveProgress(step, profileData);
  }, [profileData]);

  const handleNext = useCallback(() => {
    if (currentStep === 'profile') {
      const age = parseInt(profileData.age, 10);
      const weightKg = parseFloat(profileData.weightKg);
      const heightCm = parseInt(profileData.heightCm, 10);

      if (!profileData.gender || !age || !weightKg || !heightCm) {
        setError('Please fill in all fields');
        return;
      }

      if (age < 13 || age > 120) {
        setError('Age must be between 13 and 120');
        return;
      }

      if (weightKg < 20 || weightKg > 300) {
        setError('Weight must be between 20kg and 300kg');
        return;
      }

      if (heightCm < 50 || heightCm > 250) {
        setError('Height must be between 50cm and 250cm');
        return;
      }

      try {
        const goal = calculateMaintenanceCalories({
          age,
          gender: profileData.gender as Gender,
          weightKg,
          heightCm,
        });
        setCalculatedGoal(goal);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid input');
        return;
      }
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      goToStep(STEPS[nextIndex]);
    }
  }, [currentStep, currentStepIndex, profileData, goToStep]);

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(STEPS[prevIndex]);
    }
  }, [currentStepIndex, goToStep]);

  const handleFinish = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(profileData.age, 10),
          gender: profileData.gender,
          weightKg: parseFloat(profileData.weightKg),
          heightCm: parseInt(profileData.heightCm, 10),
          dailyCalorieGoal: calculatedGoal,
          hasCompletedOnboarding: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save settings');
      }

      clearProgress();
      router.push('/');
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(e instanceof Error ? e.message : 'Failed to save. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });
      clearProgress();
      router.push('/');
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1">
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i <= currentStepIndex ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>

          {currentStep === 'welcome' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <Flame className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Calorie Tracker</h1>
              <p className="text-gray-600 mb-8">
                Let&apos;s personalize your calorie goals based on your profile. This takes less than a minute.
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip for now
              </button>
            </div>
          )}

          {currentStep === 'profile' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Your Profile</h2>
                  <p className="text-sm text-gray-500">We use this to calculate your calorie needs</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) => {
                      const newData = { ...profileData, gender: e.target.value as Gender | '' };
                      setProfileData(newData);
                      saveProgress(currentStep, newData);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => {
                      const newData = { ...profileData, age: e.target.value };
                      setProfileData(newData);
                      saveProgress(currentStep, newData);
                      setError(null);
                    }}
                    placeholder="e.g., 30"
                    min={13}
                    max={120}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      id="weightKg"
                      type="number"
                      step="0.1"
                      value={profileData.weightKg}
                      onChange={(e) => {
                        const newData = { ...profileData, weightKg: e.target.value };
                        setProfileData(newData);
                        saveProgress(currentStep, newData);
                        setError(null);
                      }}
                      placeholder="e.g., 70"
                      min={20}
                      max={300}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="heightCm" className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      id="heightCm"
                      type="number"
                      value={profileData.heightCm}
                      onChange={(e) => {
                        const newData = { ...profileData, heightCm: e.target.value };
                        setProfileData(newData);
                        saveProgress(currentStep, newData);
                        setError(null);
                      }}
                      placeholder="e.g., 175"
                      min={50}
                      max={250}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Your Daily Goal</h2>
                  <p className="text-sm text-gray-500">Based on your profile and activity level</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="text-center py-6">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {calculatedGoal?.toLocaleString()}
                </div>
                <div className="text-gray-500 text-lg">calories per day</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium">{profileData.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-2 font-medium capitalize">{profileData.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Weight:</span>
                    <span className="ml-2 font-medium">{profileData.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Height:</span>
                    <span className="ml-2 font-medium">{profileData.heightCm} cm</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span> Saving...
                  </>
                ) : (
                  <>
                    Start Tracking <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}