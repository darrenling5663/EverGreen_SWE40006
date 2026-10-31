import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch,
  getDocs
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Track authenticated user
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        setExpenses([])
        setLoading(false)
      }
    })
    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    if (!user) return

    setLoading(true)
    // Reference: users/{uid}/expenses
    const expensesRef = collection(db, 'users', user.uid, 'expenses')
    const q = query(expensesRef, orderBy('date', 'desc'))

    // Real-time Firestore sync
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      setExpenses(docs)
      setLoading(false)
    }, (err) => {
      console.error("Error fetching expenses: ", err)
      setLoading(false)
    })

    return () => unsubscribeSnapshot()
  }, [user])

  const add = async (expenseData) => {
    if (!user) return
    try {
      await addDoc(collection(db, 'users', user.uid, 'expenses'), {
        ...expenseData,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error("Error adding expense: ", err)
    }
  }

  const update = async (id, updatedValues) => {
    if (!user || !id) return
    try {
      const docRef = doc(db, 'users', user.uid, 'expenses', id)
      await updateDoc(docRef, updatedValues)
    } catch (err) {
      console.error("Error updating expense: ", err)
    }
  }

  const remove = async (id) => {
    if (!user || !id) return
    try {
      const docRef = doc(db, 'users', user.uid, 'expenses', id)
      await deleteDoc(docRef)
    } catch (err) {
      console.error("Error deleting expense: ", err)
    }
  }

  const clear = async () => {
    if (!user) return
    try {
      const expensesRef = collection(db, 'users', user.uid, 'expenses')
      const snapshot = await getDocs(expensesRef)
      const batch = writeBatch(db)
      snapshot.docs.forEach((docItem) => {
        batch.delete(docItem.ref)
      })
      await batch.commit()
    } catch (err) {
      console.error("Error clearing expenses: ", err)
    }
  }

  return { expenses, loading, add, update, remove, clear }
}