import { useContext } from "react";
import OnboardingContext from "../contexts/OnboardingContext";

export const useOnboarding = () => useContext(OnboardingContext);
