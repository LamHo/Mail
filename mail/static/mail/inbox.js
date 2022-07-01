
window.onpopstate = function(event) {
    if(event.state.section === 'compose'){
        compose_email();
    }
    else{
        load_mailbox(event.state.section);
    }
}


document.addEventListener('DOMContentLoaded', function() {

// Use buttons to toggle between views

document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
document.querySelector('#compose').addEventListener('click', compose_email);

// By default, load the inbox
load_mailbox('inbox');

});


function compose_email() {

    history.pushState({section: 'compose'}, "", `compose`);
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector("#display-view").style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    document.querySelector("#compose_btn").value = "Send";
    document.querySelector("#pre-content").style.display = "none";

    compose_form = document.querySelector('#compose-form');
    compose_form.onsubmit = () =>  {
    fetch('/emails', {
        method: 'POST',

        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value
        })
    })
    .then(response => response.text())
    .then(result => {
        // Print result
        alert(result);
        load_mailbox('sent');
    });

    return false;

    };
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector("#display-view").style.display = 'none';
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    history.pushState({section: mailbox}, "", `${mailbox}`);

    if (mailbox === 'sent'){
        
        fetch('emails/sent')
        .then(response => response.json())
        .then(emails => {
            //console.log(emails)
            
            emails.forEach(sent_mail => {
                
                const mail = document.createElement('div');
            
                mail.className = 'sent_mail';
                mail.style = 'border-style: solid; border-width: 4px; height: 30px;display: flex;justify-content: space-between;';
                mail.innerHTML = `<div style = "display: inline-block;"><b>To: ${sent_mail.recipients}</b> &nbsp&nbsp ${sent_mail.subject}</div> <div style = "display: inline-block;">${sent_mail.timestamp}</div>`;

                // Add mail to DOM
                document.querySelector('#emails-view').append(mail);
            
                mail.addEventListener('click', () => display_mail(sent_mail, mail.className));
                
            
            
            })
                
                
            
        });
        
    }

    if (mailbox === 'inbox'){
        
        fetch('/emails/inbox')
        .then(response => response.json())
        .then(emails => {
            //alert('yes')
            emails.forEach(received_mail => {
                const mail = document.createElement('div');
            
                
                mail.className = 'received_mail';
                mail.style = 'border-style: solid; border-width: 4px; height: 30px;display: flex;justify-content: space-between;';
                mail.innerHTML = `<div style = "display: inline-block;"><b>${received_mail.sender}</b> &nbsp&nbsp ${received_mail.subject}</div> <div style = "display: inline-block;">${received_mail.timestamp}</div>`;

                // Add mail to DOM
                document.querySelector('#emails-view').append(mail);
            
                if(received_mail.read === true){
                        //change background color to gray:
                        mail.style.backgroundColor = "#c2c2a3";

                }
                mail.addEventListener('click', () => display_mail(received_mail, mail.className));

            })
            
                
        })
        
    }

    if (mailbox === 'archive'){
        fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
            //alert('yes')
            emails.forEach(received_mail => {
                const mail = document.createElement('div');
                
                
                mail.className = 'archived_mail';
                mail.style = 'border-style: solid; border-width: 4px; height: 30px;display: flex;justify-content: space-between;';
                mail.innerHTML = `<div style = "display: inline-block;"><b>${received_mail.sender}</b> &nbsp&nbsp ${received_mail.subject}</div> <div style = "display: inline-block;">${received_mail.timestamp}</div>`;

                // Add mail to DOM
                document.querySelector('#emails-view').append(mail);
                
                if(received_mail.read === true){
                        //change background color to gray:
                        mail.style.backgroundColor = "#c2c2a3";

                }
                mail.addEventListener('click', () => display_mail(received_mail, mail.className));

            })
            
                
        })
    }
}

function display_mail(received_mail, type){
    fetch(`/emails/${received_mail.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
    
    
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector("#display-view").style.display = 'block';
    //email’s sender, recipients, subject, timestamp, and body.
    document.querySelector("#info").innerHTML = `<b>From:</b> ${received_mail.sender} <br> <b>To:</b> ${received_mail.recipients} <br> <b>Subject:</b> ${received_mail.subject} <br> <b>Timestamp:</b> ${received_mail.timestamp}`
    document.querySelector("#content").innerHTML = `${received_mail.body}`;

    if(type === 'received_mail' || type === 'archived_mail'){
        
        if (received_mail.archived === false){
            document.querySelector("#archive-button").innerHTML = 'Archive';            
            document.querySelector("#archive-button").onclick = () => {
                fetch(`/emails/${received_mail.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                })
                //.then(() => alert('Archived'))
                .then(() => load_mailbox("inbox"))
                
            };
        }
        else{
            document.querySelector("#archive-button").innerHTML = 'Unarchive';        
            document.querySelector("#archive-button").onclick = () => {
                fetch(`/emails/${received_mail.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                })
                //.then(() => alert('Unarchived'))
                .then(() => load_mailbox("inbox"))
                
            };
        }                              
    }
    else{
        document.querySelector("#archive-button").style.display = 'none';
    }

    document.querySelector("#reply-button").addEventListener('click', () => reply_view(received_mail))
                
            
}

function reply_view(mail){
    compose_email();
    document.querySelector('#compose-view h3').innerHTML = "Reply";
    document.querySelector("#compose_btn").value = "Reply";
    document.querySelector('#compose-recipients').value = `${mail.sender}`;
    if(`${mail.subject}`.includes('Re: ')){
        document.querySelector('#compose-subject').value = `${mail.subject}`;
    }
    else{
        document.querySelector('#compose-subject').value = `Re: ${mail.subject}`;
    }
    
    
    user_email = document.querySelector('#user_email').innerHTML;
    document.querySelector('#pre-content').style.display = 'block';
    document.querySelector('#pre-content').innerHTML = `<p>On ${mail.timestamp} ${mail.sender} wrote:  ${mail.body}</p>`;

    compose_form = document.querySelector('#compose-form');
    compose_form.onsubmit = () =>  {
    fetch('/emails', {
        method: 'POST',

        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value + '\n' + document.querySelector('#pre-content').innerHTML + '\n'
        })
    })
    .then(response => response.text())
    .then(result => {
        // Print result
        alert(result);
        load_mailbox('sent');
    });

    return false;

    };
    
    
}
