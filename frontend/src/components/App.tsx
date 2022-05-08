import { observer } from "mobx-react-lite";
import { ToastBar, Toaster } from "react-hot-toast";

import { store } from "../store";
import { Help } from "./Help";
import { ScrollContainer } from "./ScrollContainer";
import { Sidebar } from "./Sidebar";
import "./Toast.scss";

export const App = observer(() => {
    return (
        <div>
            <Sidebar />
            {store.currentImages.length ? <ScrollContainer images={store.currentImages} /> : <Help />}
            <Toaster
                containerStyle={{
                    top: "auto",
                    bottom: "100px",
                }}
                toastOptions={{
                    duration: 4000,
                    icon: null,

                    style: {
                        padding: "20px 30px",
                        borderRadius: "5px",
                        boxShadow: "0 0 10px #000",
                        color: "#FFF",
                        maxWidth: "475px",
                    },

                    success: {
                        style: {
                            backgroundColor: "#008000",
                        },
                    },
                    error: {
                        style: {
                            backgroundColor: "#911414",
                        },
                    },
                }}
            >
                {(t) => (
                    <ToastBar
                        toast={t}
                        style={{
                            ...t.style,
                            animation: t.visible
                                ? "toast-up 1s ease"
                                : "toast-down 1s ease",
                        }}
                    />
                )}
            </Toaster>
        </div>
    );
});
