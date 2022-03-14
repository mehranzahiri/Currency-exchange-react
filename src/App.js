import React from 'react';
import "react-alice-carousel/lib/alice-carousel.css";
import {jssPreset, StylesProvider} from '@mui/styles';
import {ThemeProvider} from "@material-ui/core/styles"
import CustomTheme from "./assets/CustomTheme";
import './assets/fonts/css/fontiran.css'

import {create} from "jss";

import {BrowserRouter, Route, Routes} from "react-router-dom";
import {ConverterComponent} from "./components/ConverterComponent";

const jss = create({
    plugins: [...jssPreset().plugins],
});

function App() {
    const [value, setValue] = React.useState("/");
    // const navigate = useNavigate()

    return (
        <ThemeProvider theme={CustomTheme}>
            <StylesProvider jss={jss}>
                <BrowserRouter>
                    <Routes>

                        <Route path="/" element={
                            <ConverterComponent/>
                        }/>

                    </Routes>

                </BrowserRouter>

            </StylesProvider>
        </ThemeProvider>
    );

}


export default App;







