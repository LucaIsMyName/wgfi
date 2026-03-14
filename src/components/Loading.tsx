import { PalmtreeIcon } from "lucide-react";

const Loading = () => {
  return (
    <div className=" animate-fade-gradient flex items-center justify-center min-h-screen">
      <PalmtreeIcon
        strokeWidth={1}
        className="w-8 h-8 text-primary-green"
      />
    </div>
  );
};

export default Loading;
