import { TableBody, TableContainer, Table, TableHeader, TableCell, TableRow, TableFooter, Badge } from "@windmill/react-ui";
import { Box, Divider } from "@mui/material";
import { FormatDateToSimpleDate } from "../../../General/GeneralFunctions.js";
import { convertCentsToDollars, GetStatusColor } from "../../../../../shared_files/General/GeneralFunctions.js";


let cellStyle = {
  minWidth: "6.25rem",
  fontSize: ".875rem",
}
let cellStyleBolder = {
  fontWeight: "bolder",
  minWidth: "6.25rem",
  fontSize: ".875rem",
}

const OrdersTable = ({ orders }) => {

  return (
    <Box sx={{ bgcolor: "sectionBgColor.main", borderRadius: ".25rem", p: .6, overflowX: "auto", boxShadow: "rgba(0, 0, 0, 0.24) 0rem .1875rem .5rem;" }} >
      <TableContainer sx={{ mb: 2, width: "100%", }}>
        <Table style={{ width: "100%", }}>
          <TableHeader style={{ width: "100%" }}>
            <tr className="flex-between" style={{ width: "100%", padding: ".3125rem .625rem" }}>
              <TableCell style={{ ...cellStyleBolder, width: "13.75rem" }}>ORDER ID</TableCell>
              <TableCell style={cellStyleBolder}>CLIENT </TableCell>
              <TableCell style={cellStyleBolder}>PRICE</TableCell>
              <TableCell style={cellStyleBolder}>STATUS</TableCell>
              <TableCell style={cellStyleBolder}>DATE</TableCell>
            </tr>
          </TableHeader>
          {
            orders.map((order, index) => (
              <>
                <Divider key={index} />
                <TableBody onClick={() => { window.location.href = `/order-summary/${order._id}` }}
                  key={order} className="table-row" style={{ cursor: "pointer", }} >
                  <TableRow className="flex-between" style={{ width: "100%", padding: ".625rem" }} key={"324234"} >
                    <TableCell style={{ ...cellStyle, width: "13.75rem" }}>
                      <span className="text-sm">{order._id}</span>
                    </TableCell>
                    <TableCell style={{ ...cellStyle, width: "6.25rem", }}>
                      <span style={{ fontSize: ".9375rem" }}>{order.username.slice(0, 10)}</span>
                    </TableCell>
                    <TableCell style={{ ...cellStyle, }}>
                      <span>$ {convertCentsToDollars(order.totalAmountInCents)}</span>
                    </TableCell>
                    <TableCell style={{ ...cellStyle, }}>
                      <span style={{
                        backgroundColor: GetStatusColor(order.status),
                        color: "#f9f9f9", padding: ".125rem .4375rem",
                        borderRadius: ".3125rem",
                        fontWeight: "bold"
                      }}>{order.status}</span>
                    </TableCell>
                    <TableCell style={{ ...cellStyle, }}>
                      <span className="text-sm">
                        {FormatDateToSimpleDate(order.createdAt, FormatDateToSimpleDate)}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </>
            ))
          }
        </Table>
      </TableContainer>
    </Box >
  );
};

export default OrdersTable;
