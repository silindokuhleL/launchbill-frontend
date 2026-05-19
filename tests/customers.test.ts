import { describe, expect, it } from "vitest";
import {
  customerStatusLabel,
  customerToFormValues,
  formatCustomerAddress,
  formValuesToCustomerPayload,
} from "@/lib/customers";
import type { Customer } from "@/types/customers";

const customer: Customer = {
  id: 1,
  account_id: 1,
  name: "Naledi Mokoena",
  email: "naledi@northstar.example",
  company_name: "Northstar Analytics",
  phone: "+27 82 100 0101",
  provider_customer_id: "demo_cus_northstar",
  status: "active",
  billing_address: {
    line1: "10 Loop Street",
    city: "Cape Town",
    region: "Western Cape",
    postal_code: "8001",
    country: "ZA",
  },
  notes: "Interested in automated subscription reminders.",
  created_at: null,
  updated_at: null,
};

describe("customer helpers", () => {
  it("maps a customer into form values", () => {
    expect(customerToFormValues(customer)).toEqual({
      name: "Naledi Mokoena",
      email: "naledi@northstar.example",
      company_name: "Northstar Analytics",
      phone: "+27 82 100 0101",
      provider_customer_id: "demo_cus_northstar",
      status: "active",
      line1: "10 Loop Street",
      city: "Cape Town",
      region: "Western Cape",
      postal_code: "8001",
      country: "ZA",
      notes: "Interested in automated subscription reminders.",
    });
  });

  it("maps form values into an API payload", () => {
    expect(
      formValuesToCustomerPayload({
        name: " Browser Ventures ",
        email: "HELLO@BROWSER-VENTURES.EXAMPLE ",
        company_name: " Browser Ventures ",
        phone: " +27 82 222 0000 ",
        provider_customer_id: "",
        status: "inactive",
        line1: " 1 Test Avenue ",
        city: " Pretoria ",
        region: " Gauteng ",
        postal_code: " 0002 ",
        country: " za ",
        notes: " Created from tests. ",
      }),
    ).toEqual({
      name: "Browser Ventures",
      email: "hello@browser-ventures.example",
      company_name: "Browser Ventures",
      phone: "+27 82 222 0000",
      provider_customer_id: undefined,
      status: "inactive",
      billing_address: {
        line1: "1 Test Avenue",
        city: "Pretoria",
        region: "Gauteng",
        postal_code: "0002",
        country: "ZA",
      },
      notes: "Created from tests.",
    });
  });

  it("formats customer billing addresses", () => {
    expect(formatCustomerAddress(customer)).toBe(
      "10 Loop Street, Cape Town, Western Cape, 8001, ZA",
    );
    expect(formatCustomerAddress({ billing_address: {} })).toBe("");
  });

  it("formats customer status labels", () => {
    expect(customerStatusLabel("active")).toBe("Active");
    expect(customerStatusLabel("inactive")).toBe("Inactive");
  });
});
