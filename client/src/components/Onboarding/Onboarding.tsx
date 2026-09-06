import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import { useOnboarding } from '../../hooks/useOnboarding';

const Onboarding = () => {
    const { currentStep } = useOnboarding();

    const getPageFromStep = (step: number) => {
        switch (step) {
            case 1:
                return <Step1 />;
            case 2:
                return <Step2 />;
            default:
                return null;
        }
    }

    return (
        getPageFromStep(currentStep)
    )
}

export default Onboarding;
