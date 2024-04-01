/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I can submit a new bill", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = jest.fn()
      const firestore = {
        bills: () => ({
          create: jest.fn().mockResolvedValueOnce({ fileUrl: "url", key: "key" })
        })
      }
      const newBill = new NewBill({ document, onNavigate, store: firestore })
      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(newBill.handleSubmit)
      form.addEventListener("submit", handleSubmit)
      fireEvent.change(screen.getByTestId("file"), {
        target: { files: [new File(["test.jpg"], "test.jpg", { type: "image/jpeg" })] }
      })
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2024-03-29" }
      })
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" }
      })
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Train ticket" }
      })
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "50" }
      })
      fireEvent.change(screen.getByTestId("vat"), {
        target: { value: "10" }
      })
      fireEvent.change(screen.getByTestId("pct"), {
        target: { value: "20" }
      })
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "Test commentary" }
      })
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(firestore.bills().create).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: {
          noContentType: true
        }
      })
      expect(onNavigate).toHaveBeenCalledWith("/bills")
    })
  })
})
