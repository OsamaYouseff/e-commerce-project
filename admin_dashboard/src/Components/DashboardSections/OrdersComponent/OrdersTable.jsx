import { TableBody, TableContainer, Table, TableHeader, TableCell, TableRow, TableFooter, Badge } from "@windmill/react-ui";
import { Box, Divider, Typography } from "@mui/material";
import { convertCentsToDollars, GetStatusColor, FormatDateToSimpleDate } from "../../../General/GeneralFunctions";


let cellStyle = {
  // flexGrow: 1,
  // maxWidth: "calc(100% / 5)",
  minWidth: "100px",
  fontSize: "14px",
}
let cellStyleBolder = {
  fontWeight: "bolder",
  minWidth: "100px",
  fontSize: "14px",
}

const OrdersTable = ({ orders }) => {

  return (
    <Box sx={{ bgcolor: "sectionBgColor.main", borderRadius: "4px", p: .6, overflowX: "auto", boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;" }} >
      <TableContainer sx={{ mb: 2, width: "100%", }}>
        <Table style={{ width: "100%", }}>
          <TableHeader style={{ width: "100%" }}>
            <tr className="flex-between" style={{ width: "100%", padding: "5px 10px" }}>
              <TableCell style={{ ...cellStyleBolder, width: "220px" }}>ORDER ID</TableCell>
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
                  <TableRow className="flex-between" style={{ width: "100%", padding: "10px" }} key={"324234"} >
                    <TableCell style={{ ...cellStyle, width: "220px" }}>
                      <span className="text-sm">{order._id}</span>
                    </TableCell>
                    <TableCell style={{ ...cellStyle, width: "100px", }}>
                      <span style={{ fontSize: "15px" }}>{order.username.slice(0, 10)}</span>
                    </TableCell>
                    <TableCell style={{ ...cellStyle, }}>
                      <span>$ {convertCentsToDollars(order.totalAmountInCents)}</span>
                    </TableCell>
                    <TableCell style={{ ...cellStyle, }}>
                      <span style={{
                        backgroundColor: GetStatusColor(order.status),
                        color: "#f9f9f9", padding: "2px 7px",
                        borderRadius: "5px",
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
