import { SchemaForm } from "frontend/components/SchemaForm/SchemaForm";
import { Spacer, Tabs, Text } from "@hadmean/chromista";
import { IIntegrationsList, IActivatedAction } from "shared/types/actions";
import { useEffect } from "react";
import { ToastService } from "@hadmean/protozoa";
import { BaseActionInstances } from "frontend/views/entity/Actions/Base";
import {
  useActivateActionMutation,
  useActivationConfiguration,
} from "../../actions.store";
import { Deactivate } from "./Deactivate";
import { Configure } from "./Configure";

interface IProps {
  integrationDetail?: IIntegrationsList;
  activeAction?: IActivatedAction;
}

export function ActionSettingsView({
  integrationDetail,
  activeAction,
}: IProps) {
  const activateActionMutation = useActivateActionMutation(
    integrationDetail?.key
  );
  const activationConfiguration = useActivationConfiguration(
    activeAction?.activationId
  );

  useEffect(() => {
    if (activationConfiguration.error) {
      ToastService.error(activationConfiguration.error);
    }
  }, [activationConfiguration.error]);

  if (!integrationDetail) {
    return <Text>404: Unknown Action</Text>;
  }

  if (!activeAction) {
    return (
      <>
        <Text textStyle="italic" size="5">
          All the values provided from this form will encrypted using
          `aes-256-gcm` before been saved.
        </Text>
        <Spacer />
        <SchemaForm
          fields={integrationDetail.configurationSchema}
          onSubmit={activateActionMutation.mutateAsync}
          initialValues={{}}
          buttonText={`Activate ${integrationDetail.title}`}
        />
      </>
    );
  }

  return (
    <Tabs
      contents={[
        {
          label: "Instances",
          content: (
            <BaseActionInstances integrationKey={activeAction.integrationKey} />
          ),
        },
        {
          label: "Configure",
          content: (
            <Configure
              activationId={activeAction.activationId}
              integrationDetail={integrationDetail}
            />
          ),
        },
        {
          label: "Deactivate",
          content: (
            <Deactivate
              activationId={activeAction.activationId}
              integrationDetail={integrationDetail}
            />
          ),
        },
      ]}
    />
  );
}
