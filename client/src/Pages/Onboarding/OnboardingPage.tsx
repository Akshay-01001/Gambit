import Page1 from '../../components/Onboarding/Page1';
import Page2 from '../../components/Onboarding/Page2';
import Page3 from '../../components/Onboarding/Page3';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const OnboardingPage = () => {
    const { currentStep } = useSelector((state: RootState) => state.onboarding);

    const getPageFromStep = (step: number) => {
        switch (step) {
            case 1:
                return <Page1 />;
            case 2:
                return <Page2 />;
            case 3:
                return <Page3 />;
            default:
                return <Page1 />;
        }
    }

    return (
        getPageFromStep(currentStep)
    )
}

export default OnboardingPage;
