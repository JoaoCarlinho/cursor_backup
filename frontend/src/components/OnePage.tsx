import { useActions, useValues } from 'kea'
import { BrowserRouter } from "react-router-dom";
import { Button, Container, Paper, Typography } from '@mui/material';
// import { HashLink } from "react-router-hash-link";
import { counterLogic } from '../AppLogic';
import ApplicationSupport from './ApplicationSupport';

interface GenAIDemo {
    name: string;
    description: string;
    hidden: boolean;
    component: string;
  }

// various pages

const demos = [
    {
        name : "Multi-use context-aided Agent",
        description: "A generative AI model that helps users create artifacts using shared context",
        component: "ApplicationSupport"
    }
];

// single page app window
export default function OnePage () {
    const { setDisplayDemo } = useActions(counterLogic);
    const { displayDemo } = useValues(counterLogic);
    return(
        <BrowserRouter>
            <Container>
                {demos.map((demo) => (
                          <Paper key={demo.name} elevation={3}>
                            <Button onClick={() => {
                                setDisplayDemo(demo.name)
                            }}>{demo.name}</Button>
                          </Paper>
                        ))}
            </Container>
            {demos.map((demo) => (
                        demo.name == displayDemo &&
                          <section key={demo.name}>
                            <Typography variant="h1">{demo.name}</Typography>
                            <Typography variant="body1">{demo.description}</Typography>
                            {demo.component == 'ApplicationSupport' && <ApplicationSupport />}
                          </section>
                        ))}
        </BrowserRouter>
    )
}