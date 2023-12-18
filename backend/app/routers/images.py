# type: ignore
import os
import glob
import shutil
import cv2 as cv
import numpy as np
from PIL import Image
from deepface import DeepFace
from fastapi.responses import FileResponse
from fastapi import APIRouter, Form, Query, HTTPException, File, UploadFile
import app.config as config
from app.utils import remove_representation, check_empty_db

router = APIRouter(prefix="/images")


@router.get("/")
def get_images(return_img_file: bool | None = True):
    """
    Get database information, return all files in the database
    """
    # Remove unnecessary file
    number_of_images = len(os.listdir(config.DB_PATH))
    pkl_pattern = glob.glob(os.path.join(config.DB_PATH, "*.pkl"))
    pkl_pattern = [file.split("/")[-1] for file in pkl_pattern]

    hidden_pattern = glob.glob(os.path.join(config.DB_PATH, ".*"))
    hidden_pattern = [file.split("/")[-1] for file in hidden_pattern]

    unshow_file = pkl_pattern + hidden_pattern

    if len(pkl_pattern) != 0:
        number_of_images -= len(unshow_file)

    if return_img_file:
        return {
            "number_of_images": number_of_images,
            "image_urls": [
                f"http://0.0.0.0/api/app/data/{file}"
                for file in os.listdir(config.DB_PATH)
                if file not in unshow_file
            ],
        }
    else:
        return {
            "number_of_image": number_of_images,
        }


@router.get("/{img_path}")
def get_image(img_path: str | None = None):
    """
    Return image file from given image name

    Arguments:
        img_path(str): image file
        return_image_name(bool): Decide whether return only image file (img) or image file with extension (img.[jpg|jpeg])
    """
    empty = empty = check_empty_db()
    if empty:
        return "No image found in the database"

    if img_path is None:
        return {"error": "Client should provide image file name"}

    img_pattern = glob.glob(os.path.join(config.DB_PATH, f"*{img_path}*"))
    return FileResponse(img_pattern[0])


@router.post("/")
def face_register(
    img_file: UploadFile | None = File(None, description="Upload Image"),
    to_gray: bool
    | None = Query(default=True, description="Whether save image in gray scale or not"),
    img_save_name: str
    | None = Query(
        default=None,
        description="File's name to be save, file extension can be available or not",
    ),
):
    """
    Add new user to the database by face registering. Resize image if necessary.

     Arguments:
        img_file(File): upload image file
        img_save_name(string): name of image file need to be saved
    """
    if (img_file is None) | (not img_file):
        raise HTTPException(
            status_code=400,
            detail="Image file needs to be sent!",
        )

    save_img_dir = ""

    # Check save name is correctly
    if img_save_name is not None:
        file_extension = img_file.filename.split(".")[-1]

        # if img_save_name have extension
        if "." in img_save_name:
            img_save_name_extension = img_save_name.split(".")[-1]
            if file_extension != img_save_name_extension:
                raise HTTPException(
                    status_code=404, detail="File extension should match"
                )
            save_img_dir = os.path.join(config.DB_PATH, img_save_name)

        # Save name + extension
        else:
            save_img_dir = os.path.join(
                config.DB_PATH, f"{img_save_name}.{file_extension}"
            )
    # If not save name
    else:
        # Request file name is save name
        if "/" in img_file.filename:
            save_img_dir = os.path.join(
                config.DB_PATH, img_file.filename.split("/")[-1]
            )
        elif "\\" in img_file.filename:
            save_img_dir = os.path.join(
                config.DB_PATH, img_file.filename.split("\\")[-1]
            )
        else:
            save_img_dir = os.path.join(config.DB_PATH, img_file.filename)

    # Raise error if there is duplicate
    if os.path.exists(save_img_dir):
        raise HTTPException(
            status_code=409, detail=f"{save_img_dir} has already in the database."
        )

    # Save image to database
    if (config.RESIZE is False) and (to_gray is False):
        with open(save_img_dir, "wb") as w:
            shutil.copyfileobj(img_file.file, w)
    else:
        try:
            image = Image.open(img_file.file)
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")

            if config.RESIZE:
                image = image.resize(config.SIZE)

            np_image = np.array(image)
            np_image = cv.cvtColor(np_image, cv.COLOR_RGB2BGR)

            if to_gray:
                np_image = cv.cvtColor(np_image, cv.COLOR_BGR2GRAY)

            cv.imwrite(save_img_dir, np_image)
        except:
            raise HTTPException(
                status_code=500, detail="Something went wrong when saving the image"
            )
        finally:
            img_file.file.close()
            image.close()

    remove_representation()  # delete all representation_*.pkl created by DeepFace.find

    return {
        "message": f"{img_file.filename} has been save at {save_img_dir}.",
    }


@router.post("/recognition/")
def face_recognition(
    img_file: UploadFile = File(..., description="Query image file"),
    to_gray: bool
    | None = Query(default=True, description="Whether save image in gray scale or not"),
    return_image_name: bool = Query(
        default=True, description="Whether return only image name or full image path"
    ),
):
    """
    Do Face Recognition task, give the image which is
    the most similar with the input image from the
    database - in this case is a folder of images

    Arguments:
        img_file(File): image file
        return_image_name(bool): Decide whether return only image file (img) or image file with extension (img.[jpg|jpeg])
    Return:
        Return path to the most similar image file
    """

    # Check if database is empty
    empty = check_empty_db()
    if empty:
        return "No image found in the database"

    if len(os.listdir(config.DB_PATH)) == 0:
        return {"message": "No image found in the database."}

    # Save query image to ./query
    if not os.path.exists("query"):
        os.makedirs("query")

    if "/" in img_file.filename:
        query_img_path = os.path.join("query", img_file.filename.split("/")[-1])
    elif "\\" in img_file.filename:
        query_img_path = os.path.join("query", img_file.filename.split("\\")[-1])
    else:
        query_img_path = os.path.join("query", img_file.filename)

    # Convert image to gray (if necessary) then save it
    if to_gray:
        image = Image.open(img_file.file)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        np_image = np.array(image)
        np_image = cv.cvtColor(np_image, cv.COLOR_BGR2GRAY)

        cv.imwrite(query_img_path, np_image)
    else:
        with open(query_img_path, "wb") as w:
            shutil.copyfileobj(img_file.file, w)

    # Face detection - recognition
    # try:
    # https://github.com/serengil/deepface
    df = DeepFace.find(
        img_path=query_img_path,
        db_path=config.DB_PATH,
        model_name=config.MODELS[config.MODEL_ID],
        distance_metric=config.METRICS[config.METRIC_ID],
        detector_backend=config.DETECTORS[config.DETECTOR_ID],
        silent=True,
        align=True,
        prog_bar=False,
        enforce_detection=False,
    )
    # except:
    #     return {
    #         'error': "Error happening when trying to detecting face or recognition"
    #     }

    # Remove query image
    os.remove(query_img_path)

    # If faces are detected/recognized
    if not df.empty:
        path_to_img, metric = df.columns
        ascending = True
        if config.METRIC_ID == 0:
            ascending = False
        df = df.sort_values(by=[metric], ascending=ascending)
        value_img_path = df[path_to_img].iloc[0]

        if return_image_name:
            return_value = value_img_path.split(os.path.sep)[-1]
            return_value = return_value.split(".")[0]
            return {
                "result": return_value,
            }
        else:
            return {
                "result": value_img_path,
            }
    else:
        return {"result": "No faces have been found"}


@router.put("/images")
def update_img_name(
    src_path: str = Query(..., description="File image going to be change"),
    img_name: str = Query(..., description="New name"),
):
    """
    Change file name in database

    Arguments:
        src_path (str) Path to the source name (e.g: images/img1.jpeg)
        img_name (str) Name to be change (e.g: im2)
    Returns:
        images/img1.jpeg -> images/im2.jpeg
    """

    empty = empty = check_empty_db()
    if empty:
        return "No image found in the database"

    src_path = os.path.join(config.DB_PATH, src_path)

    new_path = "/".join(src_path.split("/")[:-1]) + "/" + img_name
    if "." not in img_name:
        extension = src_path.split(".")[1]
        new_path = new_path + "." + extension

    if not os.path.exists(src_path):
        raise HTTPException(status_code=404, detail=f"Path to {src_path} is not exist!")

    if os.path.exists(new_path):
        raise HTTPException(
            status_code=409, detail=f"{new_path} already in the database."
        )

    os.rename(src_path, new_path)

    return {"message": f"Already change {src_path} file name to {new_path}"}


@router.delete("/{img_path}")
def del_img(
    img_path: str = Query(..., description="Path to the image need to be deleted")
):
    """
    Delete a single image file in database

    Arguments:
        img_path (str) Path to the image (e.g: images/img1.jpeg)
    """
    empty = check_empty_db()
    if empty:
        return "No image found in the database"

    img_path = os.path.join(config.DB_PATH, img_path)

    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail=f"Path to {img_path} is not exist!")

    os.remove(img_path)

    return {"message": f"{img_path} has been deleted!"}


@router.delete("/reset-db")
def del_db():
    """
    Delete all file in database ~ Delete database
    """
    empty = check_empty_db()
    if empty:
        return "No image found in the database"

    for file in os.listdir(config.DB_PATH):
        os.remove(os.path.join(config.DB_PATH, file))

    if len(os.listdir(config.DB_PATH)) == 0:
        return {"message": "All file have been deleted!"}
    else:
        raise HTTPException(status_code=500, detail="Some thing wrong happened.")


# TODO: upload multiple images
# @router.get("/upload-images")
# async def upload_images(
#     img_files: list[UploadFile] = File(...),
#     additional_data: str = Form(...),
#     to_gray: bool
#     | None = Query(default=True, description="Whether save image in gray scale or not"),
#     img_save_name: str
#     | None = Query(
#         default=None,
#         description="File's name to be save, file extension can be available or not",
#     ),
# ):
#     """
#     Upload multiple images and receive additional form data.

#     Arguments:
#         files (list[UploadFile]): List of uploaded image files.
#         additional_data (str): Additional form data.

#     Returns:
#         dict: Response indicating successful upload.
#     """
#     # Process each uploaded image
#     for img_file in img_files:
#         if not img_file:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Image files need to be sent!",
#             )

#         save_img_dir = ""
#         # Check save name is correctly
#         if img_save_name is not None:
#             file_extension = img_file.filename.split(".")[-1]

#             # if img_save_name have extension
#             if "." in img_save_name:
#                 img_save_name_extension = img_save_name.split(".")[-1]
#                 if file_extension != img_save_name_extension:
#                     raise HTTPException(
#                         status_code=404, detail="File extension should match"
#                     )
#                 save_img_dir = os.path.join(config.DB_PATH, img_save_name)

#             # Save name + extension
#             else:
#                 save_img_dir = os.path.join(
#                     config.DB_PATH, f"{img_save_name}.{file_extension}"
#                 )
#         # If not save name
#         else:
#             # Request file name is save name
#             if "/" in img_file.filename:
#                 save_img_dir = os.path.join(
#                     config.DB_PATH, img_file.filename.split("/")[-1]
#                 )
#             elif "\\" in img_file.filename:
#                 save_img_dir = os.path.join(
#                     config.DB_PATH, img_file.filename.split("\\")[-1]
#                 )
#             else:
#                 save_img_dir = os.path.join(config.DB_PATH, img_file.filename)

#         # Raise error if there is duplicate
#         if os.path.exists(save_img_dir):
#             raise HTTPException(
#                 status_code=409, detail=f"{save_img_dir} has already in the database."
#             )

#         # Save image to database
#         if (config.RESIZE is False) and (to_gray is False):
#             with open(save_img_dir, "wb") as w:
#                 shutil.copyfileobj(img_file.file, w)
#         else:
#             try:
#                 image = Image.open(img_file.file)
#                 if image.mode in ("RGBA", "P"):
#                     image = image.convert("RGB")

#                 if config.RESIZE:
#                     image = image.resize(config.SIZE)

#                 np_image = np.array(image)
#                 np_image = cv.cvtColor(np_image, cv.COLOR_RGB2BGR)

#                 if to_gray:
#                     np_image = cv.cvtColor(np_image, cv.COLOR_BGR2GRAY)

#                 cv.imwrite(save_img_dir, np_image)
#             except:
#                 raise HTTPException(
#                     status_code=500, detail="Something went wrong when saving the image"
#                 )
#             finally:
#                 img_file.file.close()
#                 image.close()

#         remove_representation()  # delete all representation_*.pkl created by DeepFace.find

#         return {
#             "message": f"{img_file.filename} has been save at {save_img_dir}.",
#         }
