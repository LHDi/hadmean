import {
  DEFAULT_TABLE_PARAMS,
  DeleteButton,
  ErrorAlert,
  OffCanvas,
  SoftButton,
  Spacer,
  Stack,
  Table,
  TableSkeleton,
} from "@hadmean/chromista";
import {
  IBEPaginatedDataState,
  IFEPaginatedDataState,
  SLUG_LOADING_VALUE,
  useFEPaginatedData,
} from "@hadmean/protozoa";
import { useActiveEntities } from "frontend/hooks/entity/entity.store";
import { ViewStateMachine } from "frontend/lib/ViewStateMachine";
import {
  useIntegrationsList,
  useActiveActionList,
} from "frontend/views/actions/actions.store";
import { useCallback, useState } from "react";
import { IActionInstance } from "shared/types/actions";
import { ActionForm } from "./Form";
import {
  LIST_ACTION_INSTANCES,
  useCreateActionInstanceMutation,
  useDeleteActionInstanceMutation,
  useUpdateActionInstanceMutation,
} from "./instances.store";

interface IProps {
  entity?: string;
  integrationKey?: string;
}

const NEW_ACTION_ITEM = "__new_action_item__";

export function BaseActionInstances({ entity, integrationKey }: IProps) {
  const [paginatedDataState, setPaginatedDataState] = useState<
    IFEPaginatedDataState<IActionInstance> | IBEPaginatedDataState
  >({ ...DEFAULT_TABLE_PARAMS, pageIndex: 1 });

  const tableData = useFEPaginatedData<IActionInstance>(
    LIST_ACTION_INSTANCES({ entity, integrationKey }),
    {
      ...paginatedDataState,
      sortBy: undefined,
      pageIndex: 1,
      filters: undefined,
    }
  );

  const activeActionList = useActiveActionList();
  const integrationsList = useIntegrationsList();
  const activeEntities = useActiveEntities();

  const deleteActionInstanceMutation = useDeleteActionInstanceMutation();
  const updateActionInstanceMutation = useUpdateActionInstanceMutation();
  const createActionInstanceMutation = useCreateActionInstanceMutation();

  const [currentInstanceId, setCurrentInstanceItem] = useState("");

  const closeConfigItem = () => {
    setCurrentInstanceItem("");
  };

  const MemoizedAction = useCallback(
    ({ row }: any) => (
      <Stack spacing={4} align="center">
        <SoftButton
          action={() =>
            setCurrentInstanceItem((row.original as IActionInstance).instanceId)
          }
          label="Edit"
          justIcon
          icon="edit"
        />
        <DeleteButton
          onDelete={() =>
            deleteActionInstanceMutation.mutateAsync(
              (row.original as IActionInstance).instanceId
            )
          }
          isMakingDeleteRequest={deleteActionInstanceMutation.isLoading}
          shouldConfirmAlert
        />
      </Stack>
    ),
    [deleteActionInstanceMutation.isLoading]
  );

  if (!entity && !integrationKey) {
    return <ErrorAlert message="Pass in either of entity or the integration" />;
  }

  return (
    <>
      <ViewStateMachine
        loading={
          entity === SLUG_LOADING_VALUE ||
          activeActionList.isLoading ||
          activeEntities.isLoading ||
          integrationsList.isLoading
        }
        error={
          activeActionList.error ||
          activeEntities.error ||
          integrationsList.error
        }
        loader={<TableSkeleton />}
      >
        <Stack justify="end">
          <SoftButton
            action={() => setCurrentInstanceItem(NEW_ACTION_ITEM)}
            icon="add"
            label="Add New Form Integration"
          />
        </Stack>
        <Spacer />
        <Table
          {...{
            tableData,
            setPaginatedDataState,
            paginatedDataState,
          }}
          // TODO emptyMessage="No ${INTEGRATIONS_GROUP_LABEL[group].label}"
          columns={[
            integrationKey
              ? {
                  Header: "Entity",
                  accessor: "entity",
                  disableSortBy: true,
                }
              : {
                  Header: "Integration",
                  accessor: "integrationKey",
                  disableSortBy: true,
                },
            {
              Header: "Form Action",
              accessor: "formAction",
              disableSortBy: true,
            },
            {
              Header: "Action",
              accessor: "implementationKey",
              disableSortBy: true,
            },
            {
              Header: "Action",
              Cell: MemoizedAction,
            },
          ]}
        />
      </ViewStateMachine>
      <OffCanvas
        title={
          currentInstanceId === NEW_ACTION_ITEM
            ? `New Form Action`
            : `Edit Form Action`
        }
        onClose={closeConfigItem}
        show={!!currentInstanceId}
      >
        <ActionForm
          onSubmit={async (data) => {
            if (currentInstanceId === NEW_ACTION_ITEM) {
              await createActionInstanceMutation.mutateAsync(data);
            } else {
              await updateActionInstanceMutation.mutateAsync(data);
            }
            closeConfigItem();
          }}
          currentView={{ entity, integrationKey }}
          initialValues={(tableData?.data?.data || []).find(
            ({ instanceId }) => instanceId === currentInstanceId
          )}
          formAction={
            currentInstanceId === NEW_ACTION_ITEM ? "create" : "update"
          }
          integrationsList={integrationsList.data || []}
          activatedActions={activeActionList.data || []}
          entities={activeEntities.data || []}
        />
      </OffCanvas>
    </>
  );
}
