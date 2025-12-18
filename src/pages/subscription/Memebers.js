import React from 'react'
import { getAllSubscription } from '../../features/subscription/subscriptionSlice'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

function Memebers() {
    const dispatch = useDispatch();

    const {
        subscriptionsData,
        subscriptionLoading,
        subscriptionErrors,
    } = useSelector((state) => state.subscription);
    useEffect(() => {
        dispatch(getAllSubscription());
    }, [dispatch]);
    console.log(subscriptionsData,"subs");
    return (
        <div>Memebers</div>
    )
}

export default Memebers