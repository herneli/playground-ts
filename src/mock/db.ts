import { Db } from "../models/dashboard.model";

export const db: Db = {
  widgets: [
    {
      id: "nmon-tat",
      active: true,
      availableSizes: [
        {
          cols: 1,
          rows: 2,
        },
      ],
      attributes: {
        src: {
          binding: "setting",
          type: "string",
          title: "Source",
          value: "http://localhost:4201",
        },
        laboratory: {
          binding: "in",
          isConfig: true,
          type: "string",
          title: "Laboratorio",
        },
        initialDate: {
          binding: "in_out",
          isConfig: false,
          type: "date",
          title: "Fecha",
        },
        days: {
          binding: "in_out",
          isConfig: false,
          type: "number",
          title: "Fecha",
        },
      },
      icon: "https://workspace.navifyportal-dev.roche.com/media/icons/icon_3.svg",
      information: "Test EOS widget",
      previewImage:
        "https://workspace.navifyportal-dev.roche.com/media/icons/icon_3.svg",
      productName: "Infinity",
      scriptUrl:
        "https://workspace.navifyportal-dev.roche.com/widgets/eos/wrapper.js",
      tag: "widget-wrapper",
      title: "EOS Test Widget",
    },
  ],
  dashboards: [
    {
      id: "test",
      variables: {
        counter1: {
          type: "integer",
          title: "Contador",
          defaultValue: 10,
        },
        counter2: {
          type: "integer",
          title: "Contador",
          defaultValue: 100,
          defaultFunction: "getRandomInt",
        },
        dateFrom: {
          type: "date",
          title: "Date from",
          defaultValue: -10,
          defaultFunction: "currentDatePlusDays",
        },
      },
      widgets: [
        {
          id: "nmon-tat-001",
          widgetTypeId: "nmon-tat",
          workspaceConfig: {
            cols: 1,
            rows: 1,
            x: 1,
            y: 1,
            country: "es",
            language: "es-es",
          },
          attributes: {
            laboratory: {
              value: "Lab1",
            },
            days: {
              variable: "counter1",
            },
            initialDate: {
              variable: "dateFrom",
            },
          },
        },
        {
          id: "nmon-tat-002",
          widgetTypeId: "nmon-tat",
          workspaceConfig: {
            cols: 1,
            rows: 1,
            x: 1,
            y: 1,
            country: "es",
            language: "es-es",
          },
          attributes: {
            laboratory: {
              value: "Lab1",
            },
            initialDate: {
              variable: "dateFrom",
            },
            days: {
              variable: "counter2",
            },
          },
        },
      ],
    },
  ],
};
