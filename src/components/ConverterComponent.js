import React from 'react'
import {Grid, Paper, TextField, Button, Snackbar} from '@material-ui/core'

import ListItemText from "@material-ui/core/ListItemText";
import {makeStyles} from "@material-ui/core/styles";
import MuiAlert from "@mui/material/Alert";
import {BASE_URL, BASE_URL_API} from "../Const";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import AppBar from "@material-ui/core/AppBar";
import ToolbarMui from "@mui/material/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../assets/icons/Paysera-logo.svg";
import HomeIcon from '@mui/icons-material/Home';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const useStyles = makeStyles(theme => ({
    labelRoot: {
        right: 0
    },
    shrink: {
        transformOrigin: "top right"
    }
}));


export class ConverterComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sellValue: "",
            buyValue: "",
            openSnackbar: false,
            message: "",
            snackbarType: "success",
            selectedSellUnit: "",
            selectedBuyUnit: "",
            inputAmount: "",
            rateList: [],
            walletList: [{'unit': 'EUR', 'value': 1000}],
        }
    }


    componentDidMount() {
        localStorage.setItem("convert_count", 0)

        fetch(BASE_URL_API, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(results => {
                    let list = []
                    Object.entries(results.rates).map(([key, value]) => {
                        var s = {}
                        s.unit = key
                        s.value = value
                        list.push(s)
                    })

                    console.log(list)
                    this.setState({rateList: list})
                },
                (error) => {
                    console.log("error")
                }
            );
    }

    FormPropsTextFields = () => {

        const handleOnchange = (e) => {
            this.setState({inputAmount: e.target.value})

            this.convertPrice()
        }


        const classes = useStyles();


        return (
            <div>
                <TextField
                    fullWidth
                    required
                    onChange={handleOnchange}
                    style={{direction: "ltr", marginTop: 48}}
                    id="standard-required"
                    label="enter some value for buy"
                    placeholder="enter some value for buy"
                    InputLabelProps={{
                        classes: {root: classes.labelRoot, shrink: classes.shrink}
                    }}
                />
            </div>
        );
    }

    updateWalletByUnit(unit, value) {
        let check = false;
        this.state.walletList.forEach(function (item) {
            if (item.unit === unit) {
                item.value = value
                check = true
            }
        })

        if (!check) {
            this.state.walletList.push({'unit': unit, 'value': value})
        }

        this.setState({walletList: this.state.walletList})
    }

    findWalletByUnit(unit) {
        var target = ""
        this.state.walletList.forEach(function (item) {
            if (item.unit === unit)
                target = item
        })

        return target
    }

    findRateListByUnit(unit) {
        var target = ""
        this.state.rateList.forEach(function (item) {
            if (item.unit === unit)
                target = item
        })

        return target
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async convertPrice() {
        await this.sleep(100);

        console.log("ok")
        if (this.state.inputAmount === "") {
            this.setState({
                'openSnackbar': true,
                'message': "Please enter valid amount !",
                'snackbarType': 'error'
            })
            return
        }
        if (this.state.selectedSellUnit === "") {
            this.setState({
                'openSnackbar': true,
                'message': "Please select sell unit!",
                'snackbarType': 'error'
            })
            return
        }
        if (this.state.selectedBuyUnit === "") {
            this.setState({
                'openSnackbar': true,
                'message': "Please select buy unit!",
                'snackbarType': 'error'
            })
            return
        }

        let from = this.findRateListByUnit(this.state.selectedSellUnit)
        let to = this.findRateListByUnit(this.state.selectedBuyUnit)
        const diffPercent = parseFloat(to.value) / parseFloat(from.value);


        this.setState({sellValue: " = " + this.state.selectedSellUnit + " " + parseFloat(this.state.inputAmount).toFixed(2)})
        this.setState({buyValue: (this.state.inputAmount * diffPercent).toFixed(2) + " " + this.state.selectedBuyUnit + ""})

    }

    onSubmit = (e) => {
        if (this.state.inputAmount === "") {
            this.setState({
                'openSnackbar': true,
                'message': "Please enter valid amount !",
                'snackbarType': 'error'
            })
            return
        }
        if (this.state.selectedSellUnit === "") {
            this.setState({
                'openSnackbar': true,
                'message': "Please select sell unit!",
                'snackbarType': 'error'
            })
            return
        }
        if (this.state.selectedBuyUnit === "") {
            this.setState({
                'openSnackbar': true,
                'message': "Please select buy unit!",
                'snackbarType': 'error'
            })
            return
        }
        let from = this.findWalletByUnit(this.state.selectedSellUnit)

        if (from === "" || parseFloat(from.value)<parseFloat(this.state.inputAmount)) {
            this.setState({
                'openSnackbar': true,
                'message': "Not enough " + this.state.selectedSellUnit + " for exchange!\n First convert yout wallete to " + this.state.selectedSellUnit + ".",
                'snackbarType': 'error'
            })
            return
        }


        let decreaseAmount = parseFloat(from.value) - parseFloat(this.state.inputAmount);

        let commission = 0.0;

        if (parseInt(localStorage.getItem("convert_count")) > 3) {
            commission =
                Math.round((parseFloat(this.state.inputAmount) * 0.0007) * 100.0) / 100.0
        }

        decreaseAmount -= commission

        this.updateWalletByUnit(from.unit, decreaseAmount)

        let fromItem = this.findRateListByUnit(this.state.selectedSellUnit)
        let toItem = this.findRateListByUnit(this.state.selectedBuyUnit)

        const diffPercent = parseFloat(toItem.value) / parseFloat(fromItem.value);

        let increaseAmount = (parseFloat(this.state.inputAmount) * diffPercent)
        let finalWalletAmount = 0.0;

        let toWallet = this.findWalletByUnit(this.state.selectedBuyUnit)

        if (toWallet !== "") {
            finalWalletAmount = parseFloat(toWallet.value) + increaseAmount
        } else {
            finalWalletAmount = increaseAmount
        }

        this.updateWalletByUnit(toItem.unit, finalWalletAmount)

        localStorage.setItem("convert_count", parseInt(localStorage.getItem("convert_count")) + 1)
    }


    render() {
        const flexContainer = {
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            overflowY: 'hidden',
            align: 'right',
            marginTop: 50,
        };

        const handleCloseSnackbar = (e) => {
            this.setState({openSnackbar: false})


        }

        const paperStyle = {padding: 20, height: '70vh', width: 280, margin: "20px auto"}
        const btnStyle = {marginTop: 24, backgroundColor: '#e85600', color: 'white'}

        const handleSellUnitChange = (e) => {
            console.log(e.target.value)

            this.setState({selectedSellUnit: e.target.value})

            this.convertPrice()
        }

        const handleBuyUnitChange = (e) => {
            this.setState({selectedBuyUnit: e.target.value})
            this.convertPrice()

        }
        return (
            <React.Fragment>
                <AppBar style={{background: '#ffffff', overflow: 'auto', display: 'flex'}}>
                    <ToolbarMui justifyConten='center' alignItems='center'>
                        <MenuIcon style={{color: 'gray'}}/>

                        <img align='center' style={{width: '100%', height: 32}} alt="wallet" src={Logo}/>
                        <HomeIcon style={{color: 'gray'}}/>

                    </ToolbarMui>

                </AppBar>

                <div style={{overflowX: 'hidden', overflowY: 'hidden', height: 160}}>

                    <List style={flexContainer}>
                        {this.state.walletList.map((item) => (
                            <div style={{width: 250}}>

                                <p style={{
                                    overflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: '#da5606',
                                    width: 70,
                                    fontWeight: 'bold',
                                    fontSize: 20
                                }}
                                   align='center'>{item.unit}</p>

                                <p style={{
                                    width: 70,
                                    overflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: 'green',
                                    fontSize: 14
                                }}
                                   align='center'>{item.value.toFixed(2)}
                                </p>
                            </div>

                        ))
                        }
                    </List>
                </div>

                <Paper elevation={10} style={paperStyle}>
                    <div style={{width: 250}}>

                        <p style={{
                            overflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#bababa',
                            fontSize: 14
                        }}
                           align='left'>{this.state.sellValue}</p>

                        <p style={{
                            overflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#da5606',
                            fontWeight: 'bold',
                            fontSize: 20
                        }}
                           align='left'>{this.state.buyValue}
                        </p>
                    </div>
                    <Grid align='center'>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Sell Unit</InputLabel>

                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={this.state.selectedSellUnit}
                                label="selectedSellUnit"
                                onChange={handleSellUnitChange}
                            >
                                {
                                    this.state.rateList.map((item, index) => (
                                        <MenuItem value={item.unit}>{item.unit}</MenuItem>

                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid align='center'>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Buy Unit</InputLabel>

                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={this.state.selectedBuyUnit}
                                label="selectedBuyUnit"
                                onChange={handleBuyUnitChange}
                            >
                                {
                                    this.state.rateList.map((item, index) => (
                                        <MenuItem value={item.unit}>{item.unit}</MenuItem>

                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <this.FormPropsTextFields/>

                    <Button onClick={this.onSubmit} type='submit' variant="contained" style={btnStyle} fullWidth>Exchange
                    </Button>
                </Paper>

                <Snackbar open={this.state.openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity={this.state.snackbarType} sx={{width: '100%'}}>
                        {this.state.message}
                    </Alert>
                </Snackbar>
            </React.Fragment>

        );
    }


}
