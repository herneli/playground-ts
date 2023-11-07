import moment from "moment";

export class VariableFunctionsDefinition {
  currentDatePlusDays(days: number = 0) {
    return moment().add(days, "days").format("YYYY-MM-DD");
  }
  getRandomInt(limit: number = 100) {
    return Math.floor(Math.random() * limit);
  }
}

export const VariableFunctions = new VariableFunctionsDefinition();
