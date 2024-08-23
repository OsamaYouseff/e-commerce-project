/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";

import { ColorModeContext } from "../../../Theme/theme";
import { useTheme } from "@emotion/react";
import { FormatDate } from "../../../General/GeneralFunctions";

const ProductPreviewInCheckout = ({ index, productsCount, product, estimatedDeliveryDate }) => {
    const theme = useTheme(ColorModeContext);

    // console.log(product)

    return (
        <Stack
            key={index}
            className="flex-start-row"
            sx={{
                flexDirection: {
                    xs: "column !important",
                    md: "row !important",
                },
                mb: { xs: 2, sm: 2 },
                p: { xs: 0, sm: 2 }
            }}
            gap={4}
        >
            <Box
                sx={{
                    minWidth: {
                        xs: "100%",
                        md: "7.5rem",
                    },
                    flexGrow: 1,
                    transition: "all 0.35s ease",
                    cursor: "pointer",
                    border: ".0625rem solid transparent",
                    "&:hover": {
                        border: `.0625rem solid ${theme.palette.primary.main} `,
                    },
                    borderRadius: ".375rem",
                    p: { xs: 1, sm: 2 },
                }}
            >
                <Typography
                    variant="h6"
                    sx={{ mb: 1, fontSize: "1.125rem" }}
                >
                    Shipment [ {index + 1} of {productsCount} ] ( {product.quantity} item(s) )
                </Typography>

                <Box
                    className="flex-row-start"
                    // onClick
                    sx={{
                        gap: 2,
                        flexGrow: 1,
                        justifyContent: "flex-start",
                    }}
                >
                    <Box
                        className="flex-center"
                        sx={{
                            width: "6.875rem",
                            minHeight: "6.875rem",
                        }}
                    >
                        <img
                            src={product.productDetails.img}
                            alt="product-img"
                            style={{
                                maxWidth: "100%",
                            }}
                        />
                    </Box>
                    <Box
                        className="flex-column-center"
                        sx={{
                            minHeight: "6.875rem",
                            alignItems: "flex-start",
                        }}
                    >
                        <Typography>
                            {product.productDetails.title}
                        </Typography>
                        <Typography
                            sx={{
                                color: "#E91E63",
                            }}
                        >
                            USD{" "}
                            {product.productDetails.price}
                        </Typography>
                        <Typography>
                            Get it by{" "}
                            <span
                                style={{
                                    color: theme.palette.specialText.main,
                                }}
                            >
                                {FormatDate(estimatedDeliveryDate)}
                            </span>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Stack >
    )
}

export default ProductPreviewInCheckout;