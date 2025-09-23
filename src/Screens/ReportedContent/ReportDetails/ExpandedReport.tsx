
import { useEffect, useState } from "react"
import "./ExpandedReport.css"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"



export default function ExpandedReported(){

    const [contentBadge,setContentBadge] = useState("Comment")
    const [reasonBadge,setReasonBadge] = useState("Harassment")


    //modal handlers
    const [openDeleteConfirm,setOpenDeleteConfirm] = useState(false);
    const [openCloseConfirm,setOpenCloseConfirm] = useState(false);
    useEffect(()=>{

        

    },[])


    const deleteDialog = ()=> (
    
            <Dialog
            open={openDeleteConfirm}
    
            keepMounted
            onClose={() =>setOpenDeleteConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
            >
    
            <DialogTitle sx={{color:'red'}}>{"Delete Reported Content?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" sx={{color:'red'}}>
                    This action will permanently remove the reported content from the discussion.
                    Once deleted, it cannot be restored.
                    Do you want to continue?
                    
                </DialogContentText>
    

            </DialogContent>
    
    
    
            <DialogActions>
                <Button onClick={() =>setOpenDeleteConfirm(false)}>Cancel Action</Button>
                <Button>Continue</Button>
            </DialogActions>
            </Dialog>
    
    
    )

    const closeDialog = () => (
            <Dialog
            open={openCloseConfirm}
    
            keepMounted
            onClose={() =>setOpenCloseConfirm(false)}
            aria-describedby="alert-dialog-slide-description"
            >
    
            <DialogTitle >{"Close Report Ticket?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description" >
                    This action will mark the report as resolved and remove it from the list.
                    The reported content will remain available.
                    Do you want to continue?
                    
                </DialogContentText>
    

            </DialogContent>
    
    
    
            <DialogActions>
                <Button onClick={() =>setOpenCloseConfirm(false)}>Cancel Action</Button>
                <Button>Continue</Button>
            </DialogActions>
            </Dialog>
    )


    return(
        

     <>
        {deleteDialog()}
        {closeDialog()}
        <div className="mainWrapper">

                <div className="headerWrapper">

                    <p className="headerSection__primary">Report Details</p>
                    <span className="headerSection__secondary">Review and manage reported content</span>
                                        
                        
                  
                    <hr />
                   

                </div>


                <div className="contentWrapper__expanded">

                    <div className="metaInfo__wrapper">
                        <div className="metaInfo__wrapper__types">

                            <div className={contentBadge}>

                                <span className="badgeText">
                                    Content
                                </span>
                            </div>


                            <div className={contentBadge}>
                                <span className="badgeText">
                                    Harassment
                                </span>
                            </div>

                        </div>

                        <div className="metaInfo__wrapper__title">
                            <span className="contentTitle">
                                Inappropriate Language in Crop Discussion
                            </span>
                        </div>

                        <div className="metaInfo__wrapper__meta">

                            <div className="meta__item">
                                <span className="meta__item__label">
                                    Report Date
                                </span>

                                <span className="meta__item__primary">
                                    2024-01-15
                                </span>
                            </div>


                            <div className="meta__item">
                                <span className="meta__item__label">
                                    Original Author
                                </span>

                                <span className="meta__item__primary">
                                    Farmer_john_2024
                                </span>
                            </div>

                            <div className="meta__item">
                                <span className="meta__item__label">
                                    Location
                                </span>

                                <span className="meta__item__primary">
                                    Crop Discussion
                                </span>
                            </div>


                        </div>

                    </div>

                    <div className="reportedContentWrapper">
                        <div className="reportedContentWrapper__header">
                            <span className="header">
                                Additional Details
                            </span>
                        </div>

                        <div className="reportedContentWrapper__content">
                            <span className="content">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed 
                                euismod, nunc sit amet dictum ullamcorper, sapien elit posuere
                                neque, non condimentum nulla lacus nec justo. Integer gravida,
                                justo nec suscipit mattis, enim magna dignissim nibh, et luctus 
                                enim libero vel turpis. Quisque laoreet leo sit amet tellus   
                                ultrices, vel imperdiet erat
                                tincidunt. Duis non magna at risus pretium ultrices.
                            </span>
                        </div>
                    </div>

                    <div className="reportedContentWrapper">
                        <div className="reportedContentWrapper__header">
                            <span className="header">
                                Reported Content
                            </span>
                        </div>

                        <div className="reportedContentWrapper__content">
                            <span className="content">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed 
                                euismod, nunc sit amet dictum ullamcorper, sapien elit posuere
                                neque, non condimentum nulla lacus nec justo. Integer gravida,
                                justo nec suscipit mattis, enim magna dignissim nibh, et luctus 
                                enim libero vel turpis. Quisque laoreet leo sit amet tellus   
                                ultrices, vel imperdiet erat
                                tincidunt. Duis non magna at risus pretium ultrices.

                            </span>
                        </div>
                    </div>


                    <div className="buttonsWrapper">
                        <Button
                            variant="outlined"
                            style={{ width: "100%" }}
                            sx={{
                                mt: 0,
                                backgroundColor: "#607D8B",
                                color: "white",
                                border: 0
                            }}
                            onClick={()=>setOpenCloseConfirm(true)}
                        
                        
                            >
                            Close
                        </Button>


                        <Button
                        variant="outlined"
                        style={{ width: "100%" }}
                        sx={{
                            mt: 0,
                            backgroundColor:"transparent",
                            color: "red",
                            borderColor:'#e2e8f0',
                            border: 1
                        }}
                        onClick={() => setOpenDeleteConfirm(true)}
                    
                    
                        >
                        Delete Content
                        </Button>
                    </div>



                    
                </div>


                

      
        </div>
    </>
    )





    
}