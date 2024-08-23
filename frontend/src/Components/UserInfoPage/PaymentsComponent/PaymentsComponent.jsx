import NoItemComponent from "../../GenericComponents/NoItemsComponent/NoItemsComponent"

const PaymentsComponent = () => {
    return (
        <div style={{ minWidth: "67vw", minHeight: "70vh", padding: "0rem .625rem" }}>
            <h1>Payments Section</h1>
            <NoItemComponent message="Coming soon 😉" minHeight="60vh" fontSize={"1.5rem"} />
        </div>
    );
};

export default PaymentsComponent;
