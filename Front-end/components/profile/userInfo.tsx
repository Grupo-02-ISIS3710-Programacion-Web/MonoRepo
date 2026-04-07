"use client"

import { Droplet, Pencil, Upload } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"

type UserInfoProps = {
  name: string
  city: string
  skinType: string
  reviews: number
  posts: number
  bio: string
  photo: string
}

export default function UserInfo({
  name,
  city,
  skinType,
  reviews,
  posts,
  bio,
  photo
}: UserInfoProps) {

  const t = useTranslations("UserInfo")

  const [userName, setUserName] = useState(name)
  const [userCity, setUserCity] = useState(city)
  const [userSkinType, setUserSkinType] = useState(skinType)
  const [userBio, setUserBio] = useState(bio)
  const [userPhoto, setUserPhoto] = useState(photo)

  const [openModal, setOpenModal] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editCity, setEditCity] = useState(city)
  const [editSkinType, setEditSkinType] = useState(skinType)
  const [editBio, setEditBio] = useState(bio)
  const [editPhoto, setEditPhoto] = useState(photo)

  

 const openEditModal = () => {
    setEditName(userName)
    setEditCity(userCity)
    setEditSkinType(userSkinType)
    setEditBio(userBio)
    setEditPhoto(userPhoto)

    setOpenModal(true)
  }


  const updateInfoUser = () => {
    setUserName(editName)
    setUserCity(editCity)
    setUserSkinType(editSkinType)
    setUserBio(editBio)
    setUserPhoto(editPhoto)

    setOpenModal(false)
  }


  return (

    <div className="bg-white rounded-2xl shadow-md overflow-hidden">

      <div className="h-30 bg-linear-to-r from-pink-200 to-slate-200"></div>
      

      <div className="flex justify-center -mt-16">

        <div className="w-30 h-30 rounded-full border-4 border-white overflow-hidden bg-gray-200">

          <img
            src={userPhoto}
            alt="User"
            className="w-full h-full object-cover"
          />

        </div>

      </div>


      <h2 className="text-2xl font-bold text-center mt-4">
        {userName}
      </h2>

      <p className="text-gray-500 text-center">
        {userCity}
      </p>


      <div className="flex justify-center mt-4">

        <span className="bg-accent flex gap-2 items-center text-dark px-4 py-1 rounded-full">

          <Droplet size={14} className="fill-white stroke-white"/>

          {userSkinType}

        </span>

      </div>

    

      <div className="flex justify-around mt-6 border-t pt-4">

        <div className="text-center">

          <p className="text-xl font-bold">{reviews}</p>

          <p className="text-gray-500 text-sm">
            {t("reviews")}
          </p>

        </div>

        <div className="text-center">

          <p className="text-xl font-bold">{posts}</p>

          <p className="text-gray-500 text-sm">
            {t("posts")}
          </p>

        </div>

      </div>

      

      <p className="mt-4 text-gray-600 text-sm text-center">
        {userBio}
      </p>

      <div className="py-6 px-6">

        

        <button
          onClick={openEditModal}
          className="mt-6 w-full border border-gray-300 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >

          <Pencil size={18} />

          {t("editProfile")}

        </button>

       

        {openModal && (

          <div data-testid="edit-modal" className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl p-6 w-105 shadow-xl">

              <h2 className="text-xl font-bold mb-5">
                {t("editProfile")}
              </h2>

              

              <div className="flex flex-col items-center mb-4">

                <div className="w-24 h-24 rounded-full overflow-hidden border">

                  <img
                    src={editPhoto}
                    className="w-full h-full object-cover"
                  />

                </div>

                <label className="flex items-center gap-2 text-sm text-primary cursor-pointer mt-2">

                  <Upload size={16}/>

                  {t("changePhoto")}

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e)=>{
                      const file = e.target.files?.[0]
                      if(file){
                        setEditPhoto(URL.createObjectURL(file))
                      }
                    }}
                  />

                </label>

              </div>

              

              <div className="flex flex-col gap-3">

                <div>

                  <label className="text-sm font-medium text-gray-600">
                    {t("name")}
                  </label>

                  <input
                    value={editName}
                    onChange={(e)=>setEditName(e.target.value)}
                    className="border w-full p-2 rounded-lg"
                  />

                </div>

                <div>

                  <label className="text-sm font-medium text-gray-600">
                    {t("city")}
                  </label>

                  <input
                    value={editCity}
                    onChange={(e)=>setEditCity(e.target.value)}
                    className="border w-full p-2 rounded-lg"
                  />

                </div>

                <div>

                  <label className="text-sm font-medium text-gray-600">
                    {t("skinType")}
                  </label>

                  <input
                    value={editSkinType}
                    onChange={(e)=>setEditSkinType(e.target.value)}
                    className="border w-full p-2 rounded-lg"
                  />

                </div>

                <div>

                  <label className="text-sm font-medium text-gray-600">
                    {t("bio")}
                  </label>

                  <textarea
                    value={editBio}
                    onChange={(e)=>setEditBio(e.target.value)}
                    className="border w-full p-2 rounded-lg"
                  />

                </div>

              </div>

              

              <div className="flex justify-end gap-2 mt-5">

                <button
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  {t("cancel")}
                </button>

                <button
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                  onClick={updateInfoUser}
                >
                  {t("save")}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  )
}