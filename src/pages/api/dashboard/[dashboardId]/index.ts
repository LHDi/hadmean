import { dashboardController } from "backend/dashboard/dashboard.controller";
import { USER_PERMISSIONS } from "shared/types";
import { requestHandler } from "../../../../backend/lib/request";

export default requestHandler(
  {
    GET: async (getValidatedRequest) => {
      const validatedRequest = await getValidatedRequest([
        { _type: "requestQuery", options: "dashboardId" },
      ]);
      return await dashboardController.listDashboardItems(
        validatedRequest.requestQuery
      );
    },
    POST: async (getValidatedRequest) => {
      const validatedRequest = await getValidatedRequest([
        { _type: "requestQuery", options: "dashboardId" },
        { _type: "requestBody", options: {} },
      ]);
      return await dashboardController.createDashboardItem(
        validatedRequest.requestBody,
        validatedRequest.requestQuery
      );
    },
    PATCH: async (getValidatedRequest) => {
      const validatedRequest = await getValidatedRequest([
        { _type: "requestQuery", options: "dashboardId" },
        { _type: "requestBody", options: {} },
      ]);
      return await dashboardController.updateDashboardList(
        validatedRequest.requestQuery,
        validatedRequest.requestBody
      );
    },
  },
  [
    {
      _type: "canUser",
      body: USER_PERMISSIONS.CAN_MANAGE_DASHBOARD,
    },
  ]
);