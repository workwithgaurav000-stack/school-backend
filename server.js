
// ==========================================
// SCHOOL ADMISSION WEBSITE - BACKEND
// ==========================================

const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "*";


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", frontendUrl);
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    if (req.method === "OPTIONS") {

        return res.sendStatus(204);

    }

    next();

});


// ==========================================
// FRONTEND FOLDER
// ==========================================

// backend folder से एक level ऊपर जाकर
// frontend folder को serve करेगा

const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(frontendPath, "index.html")
    );

});


// ==========================================
// GMAIL TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.GMAIL_USER,

        pass: process.env.GMAIL_APP_PASSWORD

    }

});


// ==========================================
// CHECK GMAIL CONNECTION
// ==========================================

transporter.verify((error, success) => {

    if (error) {

        console.log("❌ Gmail connection failed.");
        console.log(error.message);

    } else {

        console.log("✅ Gmail connection successful.");

    }

});


// ==========================================
// ADMISSION FORM API
// ==========================================

app.post("/api/admission", async (req, res) => {

    try {

        const {

            studentName,
            studentClass,
            fatherName,
            contactNumber,
            mode

        } = req.body;


        // ==================================
        // VALIDATION
        // ==================================

        if (
            !studentName ||
            !studentClass ||
            !fatherName ||
            !contactNumber ||
            !mode
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill all admission form fields."

            });

        }


        // ==================================
        // MOBILE NUMBER VALIDATION
        // ==================================

        if (!/^[0-9]{10}$/.test(contactNumber)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid 10 digit mobile number."

            });

        }


        // ==================================
        // ADMISSION EMAIL
        // ==================================

        const mailOptions = {

            from: `"School Name X Y Z" <${process.env.GMAIL_USER}>`,

            to: "work.with.gaurav.000@gmail.com",

            subject:
                `🎓 New Pre-Admission Application - ${studentName}`,

            html: `

                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <style>

                        body {

                            font-family: Arial, sans-serif;

                            background: #f4f7fb;

                            padding: 20px;

                        }

                        .container {

                            max-width: 650px;

                            margin: auto;

                            background: white;

                            border-radius: 15px;

                            overflow: hidden;

                            box-shadow:
                                0 5px 20px
                                rgba(0,0,0,0.10);

                        }

                        .header {

                            background:
                                linear-gradient(
                                    135deg,
                                    #174ca8,
                                    #5b2db4
                                );

                            color: white;

                            padding: 25px;

                            text-align: center;

                        }

                        .header h1 {

                            margin: 0;

                            font-size: 26px;

                        }

                        .content {

                            padding: 25px;

                        }

                        .row {

                            padding: 14px;

                            border-bottom:
                                1px solid #eeeeee;

                        }

                        .label {

                            font-weight: bold;

                            color: #174ca8;

                        }

                        .value {

                            margin-top: 5px;

                            font-size: 17px;

                        }

                        .footer {

                            background: #f5f7fa;

                            padding: 18px;

                            text-align: center;

                            color: #666;

                        }

                    </style>

                </head>


                <body>

                    <div class="container">

                        <div class="header">

                            <h1>
                                🎓 New Pre-Admission Application
                            </h1>

                            <p>
                                School Name X Y Z • Jaynagar
                            </p>

                        </div>


                        <div class="content">


                            <div class="row">

                                <div class="label">
                                    Student Name
                                </div>

                                <div class="value">
                                    ${escapeHtml(studentName)}
                                </div>

                            </div>


                            <div class="row">

                                <div class="label">
                                    Class for Admission
                                </div>

                                <div class="value">
                                    ${escapeHtml(studentClass)}
                                </div>

                            </div>


                            <div class="row">

                                <div class="label">
                                    Father's Name
                                </div>

                                <div class="value">
                                    ${escapeHtml(fatherName)}
                                </div>

                            </div>


                            <div class="row">

                                <div class="label">
                                    Contact Number
                                </div>

                                <div class="value">
                                    ${escapeHtml(contactNumber)}
                                </div>

                            </div>


                            <div class="row">

                                <div class="label">
                                    Admission Mode
                                </div>

                                <div class="value">
                                    ${escapeHtml(mode)}
                                </div>

                            </div>


                            <div class="row">

                                <div class="label">
                                    Application Time
                                </div>

                                <div class="value">
                                    ${new Date().toLocaleString("en-IN")}
                                </div>

                            </div>


                        </div>


                        <div class="footer">

                            <p>
                                This admission application was
                                submitted from the school website.
                            </p>

                        </div>

                    </div>

                </body>

                </html>

            `

        };


        // ==================================
        // SEND EMAIL
        // ==================================

        await transporter.sendMail(mailOptions);


        console.log("");
        console.log("====================================");
        console.log("🎓 NEW ADMISSION APPLICATION");
        console.log("====================================");
        console.log("Student:", studentName);
        console.log("Class:", studentClass);
        console.log("Father:", fatherName);
        console.log("Contact:", contactNumber);
        console.log("Mode:", mode);
        console.log("====================================");
        console.log("📧 Email sent successfully!");
        console.log("====================================");
        console.log("");


        // ==================================
        // SUCCESS RESPONSE
        // ==================================

        res.status(200).json({

            success: true,

            message:
                "Admission form submitted successfully."

        });


    }

    catch (error) {

        console.log("");
        console.log("❌ EMAIL ERROR");
        console.log(error);
        console.log("");


        res.status(500).json({

            success: false,

            message:
                "Admission form submit नहीं हो पाया। Please try again."

        });

    }

});


// ==========================================
// HTML ESCAPE FUNCTION
// ==========================================

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// 404 API HANDLER
// ==========================================

app.use("/api", (req, res) => {

    res.status(404).json({

        success: false,

        message: "API endpoint not found."

    });

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("");
    console.log("========================================");
    console.log("🏫 SCHOOL WEBSITE BACKEND");
    console.log("========================================");
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log("========================================");
    console.log("");

});