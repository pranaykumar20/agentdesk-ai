import type { CalendarProvider } from "../types";

export const mockCalendarProvider: CalendarProvider = {
  name: "mock",

  async getAvailability(input) {
    return [
      { start: input.from, end: new Date(new Date(input.from).getTime() + 30 * 60000).toISOString() },
    ];
  },

  async createAppointment() {
    return { externalId: `mock_cal_${crypto.randomUUID()}` };
  },

  async rescheduleAppointment() {
    // no-op
  },

  async cancelAppointment() {
    // no-op
  },
};
