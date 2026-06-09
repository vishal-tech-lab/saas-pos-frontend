import React from "react";
import { FEATURES } from "../utils/features";

const FeatureGuard = ({
  feature,
  children
}) => {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    ) || {};

  const features =
    FEATURES[user.plan] || [];

  const hasAccess =
    features.includes(feature);

  if (!hasAccess) {

    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">
          Upgrade to PRO Plan
        </h2>

        <p className="mt-2">
          This feature is available only for PRO users.
        </p>
      </div>
    );
  }

  return children;
};

export default FeatureGuard;