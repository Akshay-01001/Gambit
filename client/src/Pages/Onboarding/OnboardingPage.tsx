import Step1 from '../../components/Onboarding/Step1';
import Step2 from '../../components/Onboarding/Step2';
import Step3 from '../../components/Onboarding/Step3';
import { useOnboarding } from '../../hooks/useOnboarding';

const OnboardingPage = () => {
    const { currentStep } = useOnboarding();

    const getPageFromStep = (step: number) => {
        switch (step) {
            case 1:
                return <Step1 />;
            case 2:
                return <Step2 />;
            case 3:
                return <Step3 />;
            default:
                return <Step1 />;
        }
    }

    return (
        getPageFromStep(currentStep)
    )
}

export default OnboardingPage;
